import { Capacitor } from '@capacitor/core'
import { LOG_LEVEL, Purchases } from '@revenuecat/purchases-capacitor'
import type { CustomerInfo, PurchasesPackage } from '@revenuecat/purchases-capacitor'

const PLUS_ENTITLEMENT_ID = import.meta.env.VITE_REVENUECAT_ENTITLEMENT_ID || 'plus'
const IOS_API_KEY = import.meta.env.VITE_REVENUECAT_IOS_PUBLIC_API_KEY || ''
const ANDROID_API_KEY = import.meta.env.VITE_REVENUECAT_ANDROID_PUBLIC_API_KEY || ''

export class RevenueCatUnavailableError extends Error {
  constructor(message = 'Purchases are only available in the iOS or Android app.') {
    super(message)
    this.name = 'RevenueCatUnavailableError'
  }
}

export class RevenueCatUserCancelledError extends Error {
  constructor() {
    super('Purchase cancelled.')
    this.name = 'RevenueCatUserCancelledError'
  }
}

type PurchaseFailure = {
  userCancelled?: boolean
  message?: string
}

function platform_api_key(): string {
  const platform = Capacitor.getPlatform()
  if (platform === 'ios') return IOS_API_KEY
  if (platform === 'android') return ANDROID_API_KEY
  throw new RevenueCatUnavailableError()
}

function assert_configured_for_mobile(): string {
  const apiKey = platform_api_key()
  if (!apiKey) throw new RevenueCatUnavailableError('RevenueCat public API key is missing for this platform.')
  return apiKey
}

function purchase_error(error: unknown): Error {
  if (typeof error === 'object' && error !== null && 'userCancelled' in error && Boolean((error as PurchaseFailure).userCancelled)) {
    return new RevenueCatUserCancelledError()
  }
  if (error instanceof Error) return error
  return new Error('The purchase could not be completed.')
}

export async function ensure_revenuecat_configured(user_id: string): Promise<void> {
  const apiKey = assert_configured_for_mobile()
  const configured = await Purchases.isConfigured().catch(() => ({ isConfigured: false }))
  if (!configured.isConfigured) {
    if (import.meta.env.DEV) await Purchases.setLogLevel({ level: LOG_LEVEL.DEBUG })
    await Purchases.configure({ apiKey, appUserID: user_id })
    return
  }

  const current = await Purchases.getAppUserID()
  if (current.appUserID !== user_id) {
    await Purchases.logIn({ appUserID: user_id })
  }
}

export async function log_out_revenuecat(): Promise<void> {
  const configured = await Purchases.isConfigured().catch(() => ({ isConfigured: false }))
  if (!configured.isConfigured) return
  await Purchases.logOut().catch(() => undefined)
}

export function customer_has_plus(customerInfo: CustomerInfo): boolean {
  const entitlement = customerInfo.entitlements.active[PLUS_ENTITLEMENT_ID]
  return Boolean(entitlement?.isActive)
}

export async function get_plus_package(user_id: string): Promise<PurchasesPackage> {
  await ensure_revenuecat_configured(user_id)
  const offerings = await Purchases.getOfferings()
  const offering = offerings.current
  const pack = offering?.monthly ?? offering?.availablePackages[0]
  if (!pack) throw new RevenueCatUnavailableError('Hatrick Plus is not available yet.')
  return pack
}

export async function purchase_plus_package(user_id: string): Promise<CustomerInfo> {
  try {
    const pack = await get_plus_package(user_id)
    const result = await Purchases.purchasePackage({ aPackage: pack })
    return result.customerInfo
  } catch (error) {
    throw purchase_error(error)
  }
}

export async function restore_revenuecat_purchases(user_id: string): Promise<CustomerInfo> {
  try {
    await ensure_revenuecat_configured(user_id)
    const result = await Purchases.restorePurchases()
    return result.customerInfo
  } catch (error) {
    throw purchase_error(error)
  }
}

export async function get_revenuecat_management_url(user_id: string): Promise<string | null> {
  await ensure_revenuecat_configured(user_id)
  const result = await Purchases.getCustomerInfo()
  return result.customerInfo.managementURL
}

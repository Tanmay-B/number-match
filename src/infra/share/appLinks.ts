export const APP_LINKS = {
  androidPackage: 'com.numbermatch',
  iosAppStoreId: '',
  customScheme: 'numbermatch',
  webRedirectUrl: '',
} as const

export function getPlayStoreUrl(): string {
  return `https://play.google.com/store/apps/details?id=${APP_LINKS.androidPackage}`
}

export function getAppStoreUrl(): string {
  if (APP_LINKS.iosAppStoreId) {
    return `https://apps.apple.com/app/id${APP_LINKS.iosAppStoreId}`
  }

  return 'https://apps.apple.com/search?term=Number+Match'
}

export function getDeepLinkUrl(path = 'play'): string {
  return `${APP_LINKS.customScheme}://${path}`
}

export function getPrimaryShareUrl(): string {
  if (APP_LINKS.webRedirectUrl) {
    return APP_LINKS.webRedirectUrl
  }

  return getPlayStoreUrl()
}

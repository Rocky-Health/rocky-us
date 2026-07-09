// Hides the Zendesk Messenger launcher on small viewports while a NAD+
// page is mounted, so it doesn't overlap the sticky "Get Started" CTA bar.
// The page already exposes the sticky CTA on mobile, so the chat launcher
// is redundant footprint there. Desktop behavior is fully preserved.
//
// CSS-based, same approach as TK-653's ZendeskHiddenStyle: the previous
// implementation called zE("messenger", "hide") on a retry schedule, but the
// Zendesk snippet loads with strategy="lazyOnload" — on real mobile devices
// window.zE regularly appears AFTER the last retry, leaving the launcher
// visible on top of the sticky CTA. A media-queried stylesheet is robust
// regardless of when (or whether) the SDK loads, and unmounting the route
// removes it automatically. Only Zendesk-specific selectors are used (see
// ZendeskHiddenStyle for why broad close-button selectors are dangerous).

const NAD_MOBILE_ZENDESK_HIDE_CSS = `
@media (max-width: 767px) {
  #launcher,
  #messenger,
  [data-testid="launcher"],
  .zE-launcher,
  .zE-messenger,
  .zendesk-widget,
  .zendesk-chat,
  iframe[title*="Zendesk" i],
  iframe[title*="Messenger" i],
  iframe[title*="messaging window" i],
  iframe[title*="Close message" i],
  iframe[title*="Message from company" i],
  iframe[id*="zendesk"],
  iframe[id*="messenger"],
  div[id*="zendesk"],
  div[id*="messenger"],
  div[class*="zendesk"],
  button[aria-label*="Zendesk"],
  button[title*="Zendesk"],
  a[aria-label*="Zendesk"] {
    display: none !important;
    visibility: hidden !important;
    opacity: 0 !important;
    pointer-events: none !important;
  }
}
`;

export default function LongevityNadChatWidgetMobileFix() {
    return (
        <style dangerouslySetInnerHTML={{ __html: NAD_MOBILE_ZENDESK_HIDE_CSS }} />
    );
}

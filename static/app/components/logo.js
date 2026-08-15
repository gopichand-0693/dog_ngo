/** ScoobyHouse logo — cartoon dog nose (animated). */
export function logoMarkup(extraClass = "") {
  const classes = ["logo-dog", extraClass].filter(Boolean).join(" ");
  return `
    <svg class="${classes}" viewBox="0 0 40 40" width="50" height="50" aria-hidden="true" focusable="false">
      <rect class="logo-bg" width="40" height="40" rx="20" fill="#CC0000"/>
      <!-- soft snout pad -->
      <ellipse cx="20" cy="24.5" rx="12.5" ry="9.5" fill="#F3D7B8"/>
      <ellipse cx="20" cy="25.2" rx="10.8" ry="7.8" fill="#F8E0C8"/>
      <!-- cartoon nose -->
      <g class="logo-nose-group">
        <ellipse class="logo-nose" cx="20" cy="18.2" rx="9.2" ry="7.4" fill="#1A1816"/>
        <ellipse cx="20" cy="18.6" rx="8.2" ry="6.2" fill="#2B2826"/>
        <!-- nostrils -->
        <ellipse cx="16.2" cy="19.4" rx="2.1" ry="2.6" fill="#0B0A09"/>
        <ellipse cx="23.8" cy="19.4" rx="2.1" ry="2.6" fill="#0B0A09"/>
        <!-- gloss -->
        <ellipse class="logo-nose-shine" cx="15.8" cy="14.2" rx="3.4" ry="2.1" fill="#F5F5F5" opacity="0.9"/>
        <ellipse cx="24.8" cy="15.1" rx="1.3" ry="0.8" fill="#F5F5F5" opacity="0.45"/>
      </g>
      <!-- smile line -->
      <path d="M20 25.2 V29.5" stroke="#C4A484" stroke-width="1.4" stroke-linecap="round"/>
      <path d="M14.5 29.8 C17 31.6 23 31.6 25.5 29.8" stroke="#C4A484" stroke-width="1.4" stroke-linecap="round" fill="none"/>
    </svg>
  `;
}

import React from 'react'

import Script from 'dangerous-html/react'

import './footer.css'

const Footer = (props) => {
  return (
    <div className="footer-container1">
      <div className="footer-container2">
        <div className="footer-container3">
          <Script
            html={`<style>
@media (prefers-reduced-motion: reduce) {
.footer__scanline, .footer__corner, .footer__particle, .footer__logo-icon::before, .footer__divider-glow {
  animation: none;
}
.footer__nav-link:hover, .footer__contact-item:hover, .footer__social-link:hover {
  transform: none;
}
}
</style>`}
          ></Script>
        </div>
      </div>
      <footer id="footer" className="footer">
        <div className="footer__container">
          <div aria-hidden="true" className="footer__scanline"></div>
          <div className="footer__top">
            <div className="footer__brand">
              <div className="footer__logo">
                <div aria-hidden="true" className="footer__logo-icon">
                  <svg
                    width="32"
                    xmlns="http://www.w3.org/2000/svg"
                    height="32"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></path>
                  </svg>
                </div>
                <span className="footer__logo-text">EventSync</span>
              </div>
              <p className="footer__tagline">
                {' '}
                イベント管理の未来を創造する次世代プラットフォーム
                <span
                  dangerouslySetInnerHTML={{
                    __html: ' ',
                  }}
                />
              </p>
            </div>
            <div className="footer__nav-grid">
              <div className="footer__nav-column">
                <h3 className="footer__nav-title">プロダクト</h3>
                <ul className="footer__nav-list">
                  <li className="footer__nav-item">
                    <a href="#features">
                      <div className="footer__nav-link">
                        <svg
                          width="16"
                          xmlns="http://www.w3.org/2000/svg"
                          height="16"
                          viewBox="0 0 24 24"
                        >
                          <g
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M8 2v4m8-4v4"></path>
                            <rect
                              x="3"
                              y="4"
                              rx="2"
                              width="18"
                              height="18"
                            ></rect>
                            <path d="M3 10h18"></path>
                          </g>
                        </svg>
                        <span>スケジュール管理</span>
                      </div>
                    </a>
                  </li>
                  <li className="footer__nav-item">
                    <a href="#members">
                      <div className="footer__nav-link">
                        <svg
                          width="16"
                          xmlns="http://www.w3.org/2000/svg"
                          height="16"
                          viewBox="0 0 24 24"
                        >
                          <g
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M16 3.128a4 4 0 0 1 0 7.744M22 21v-2a4 4 0 0 0-3-3.87"></path>
                            <circle r="4" cx="9" cy="7"></circle>
                          </g>
                        </svg>
                        <span>メンバー管理</span>
                      </div>
                    </a>
                  </li>
                  <li className="footer__nav-item">
                    <a href="/materials">
                      <div className="footer__nav-link">
                        <svg
                          width="16"
                          xmlns="http://www.w3.org/2000/svg"
                          height="16"
                          viewBox="0 0 24 24"
                        >
                          <g
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"></path>
                            <path d="m3.3 7l8.7 5l8.7-5M12 22V12"></path>
                          </g>
                        </svg>
                        <span>資材管理</span>
                      </div>
                    </a>
                  </li>
                  <li className="footer__nav-item">
                    <a href="#analytics">
                      <div className="footer__nav-link">
                        <span>リアルタイム分析</span>
                      </div>
                    </a>
                  </li>
                </ul>
              </div>
              <div className="footer__nav-column">
                <h3 className="footer__nav-title">企業情報</h3>
                <ul className="footer__nav-list">
                  <li className="footer__nav-item">
                    <a href="#about">
                      <div className="footer__nav-link">
                        <span>会社概要</span>
                      </div>
                    </a>
                  </li>
                  <li className="footer__nav-item">
                    <a href="#team">
                      <div className="footer__nav-link">
                        <span>チーム</span>
                      </div>
                    </a>
                  </li>
                  <li className="footer__nav-item">
                    <a href="#careers">
                      <div className="footer__nav-link">
                        <span>採用情報</span>
                      </div>
                    </a>
                  </li>
                  <li className="footer__nav-item">
                    <a href="#press">
                      <div className="footer__nav-link">
                        <span>プレスリリース</span>
                      </div>
                    </a>
                  </li>
                </ul>
              </div>
              <div className="footer__nav-column">
                <h3 className="footer__nav-title">サポート</h3>
                <ul className="footer__nav-list">
                  <li className="footer__nav-item">
                    <a href="#docs">
                      <div className="footer__nav-link">
                        <span>ドキュメント</span>
                      </div>
                    </a>
                  </li>
                  <li className="footer__nav-item">
                    <a href="#api">
                      <div className="footer__nav-link">
                        <span>API リファレンス</span>
                      </div>
                    </a>
                  </li>
                  <li className="footer__nav-item">
                    <a href="#help">
                      <div className="footer__nav-link">
                        <span>ヘルプセンター</span>
                      </div>
                    </a>
                  </li>
                  <li className="footer__nav-item">
                    <a href="#contact">
                      <div className="footer__nav-link">
                        <span>お問い合わせ</span>
                      </div>
                    </a>
                  </li>
                </ul>
              </div>
              <div className="footer__contact-column footer__nav-column">
                <h3 className="footer__nav-title">コンタクト</h3>
                <ul className="footer__contact-list">
                  <li className="footer__contact-item">
                    <div aria-hidden="true" className="footer__contact-icon">
                      <svg
                        width="20"
                        xmlns="http://www.w3.org/2000/svg"
                        height="20"
                        viewBox="0 0 24 24"
                      >
                        <g
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="m22 7l-8.991 5.727a2 2 0 0 1-2.009 0L2 7"></path>
                          <rect
                            x="2"
                            y="4"
                            rx="2"
                            width="20"
                            height="16"
                          ></rect>
                        </g>
                      </svg>
                    </div>
                    <a href="mailto:info@eventsync.jp?subject=">
                      <div className="footer__contact-link">
                        <span>
                          {' '}
                          info@eventsync.jp
                          <span
                            dangerouslySetInnerHTML={{
                              __html: ' ',
                            }}
                          />
                        </span>
                      </div>
                    </a>
                  </li>
                  <li className="footer__contact-item">
                    <div aria-hidden="true" className="footer__contact-icon">
                      <svg
                        width="20"
                        xmlns="http://www.w3.org/2000/svg"
                        height="20"
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233a14 14 0 0 0 6.392 6.384"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        ></path>
                      </svg>
                    </div>
                    <a href="tel:+81312345678">
                      <div className="footer__contact-link">
                        <span>
                          {' '}
                          03-1234-5678
                          <span
                            dangerouslySetInnerHTML={{
                              __html: ' ',
                            }}
                          />
                        </span>
                      </div>
                    </a>
                  </li>
                  <li className="footer__contact-item">
                    <div aria-hidden="true" className="footer__contact-icon">
                      <svg
                        width="20"
                        xmlns="http://www.w3.org/2000/svg"
                        height="20"
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0zm.894.211v15M9 3.236v15"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        ></path>
                      </svg>
                    </div>
                    <address className="footer__contact-link">
                      東京都渋谷区 1-2-3
                    </address>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div aria-hidden="true" className="footer__divider">
            <div className="footer__divider-glow"></div>
          </div>
          <div className="footer__bottom">
            <div className="footer__bottom-left">
              <p className="footer__copyright">
                © 2025 EventSync. All rights reserved.
              </p>
              <div className="footer__legal">
                <a href="#privacy">
                  <div className="footer__legal-link">
                    <span>プライバシーポリシー</span>
                  </div>
                </a>
                <span aria-hidden="true" className="footer__legal-separator">
                  •
                </span>
                <a href="#terms">
                  <div className="footer__legal-link">
                    <span>利用規約</span>
                  </div>
                </a>
                <span aria-hidden="true" className="footer__legal-separator">
                  •
                </span>
                <a href="#security">
                  <div className="footer__legal-link">
                    <span>セキュリティ</span>
                  </div>
                </a>
              </div>
            </div>
            <div className="footer__social">
              <a href="#twitter">
                <div aria-label="Twitter" className="footer__social-link">
                  <svg
                    width="20"
                    xmlns="http://www.w3.org/2000/svg"
                    height="20"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6c2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4c-.9-4.2 4-6.6 7-3.8c1.1 0 3-1.2 3-1.2"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></path>
                  </svg>
                </div>
              </a>
              <a href="#github">
                <div aria-label="GitHub" className="footer__social-link">
                  <svg
                    width="20"
                    xmlns="http://www.w3.org/2000/svg"
                    height="20"
                    viewBox="0 0 24 24"
                  >
                    <g
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5c.08-1.25-.27-2.48-1-3.5c.28-1.15.28-2.35 0-3.5c0 0-1 0-3 1.5c-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.4 5.4 0 0 0 4 9c0 3.5 3 5.5 6 5.5c-.39.49-.68 1.05-.85 1.65S8.93 17.38 9 18v4"></path>
                      <path d="M9 18c-4.51 2-5-2-7-2"></path>
                    </g>
                  </svg>
                </div>
              </a>
              <a href="#linkedin">
                <div aria-label="LinkedIn" className="footer__social-link">
                  <svg
                    width="20"
                    xmlns="http://www.w3.org/2000/svg"
                    height="20"
                    viewBox="0 0 24 24"
                  >
                    <g
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2a2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6M2 9h4v12H2z"></path>
                      <circle r="2" cx="4" cy="4"></circle>
                    </g>
                  </svg>
                </div>
              </a>
            </div>
          </div>
          <div
            aria-hidden="true"
            className="footer__corner footer__corner--tl"
          ></div>
          <div
            aria-hidden="true"
            className="footer__corner--tr footer__corner"
          ></div>
          <div
            aria-hidden="true"
            className="footer__corner footer__corner--bl"
          ></div>
          <div
            aria-hidden="true"
            className="footer__corner footer__corner--br"
          ></div>
          <div aria-hidden="true" className="footer__particles">
            <div className="footer__particle"></div>
            <div className="footer__particle"></div>
            <div className="footer__particle"></div>
            <div className="footer__particle"></div>
            <div className="footer__particle"></div>
            <div className="footer__particle"></div>
          </div>
        </div>
      </footer>
      <div className="footer-container4">
        <div className="footer-container5">
          <Script
            html={`<style>
        @keyframes footerScanline {0%,100% {transform: translateX(-100%);
opacity: 0;}
10%,90% {opacity: 0.5;}
50% {transform: translateX(100%);}}@keyframes footerCornerPulse {0%,100% {opacity: 0.3;
filter: drop-shadow(0 0 0px var(--color-accent));}
50% {opacity: 0.6;
filter: drop-shadow(0 0 8px var(--color-accent));}}@keyframes footerParticleFloat {0% {transform: translateY(100vh) scale(0);
opacity: 0;}
10% {opacity: 1;}
90% {opacity: 1;}
100% {transform: translateY(-20vh) scale(1.5);
opacity: 0;}}@keyframes footerLogoShine {0%,100% {transform: translateX(-100%) translateY(-100%) rotate(45deg);}
50% {transform: translateX(100%) translateY(100%) rotate(45deg);}}@keyframes footerDividerPulse {0%,100% {opacity: 0.3;
transform: translate(-50%, -50%) scale(1);}
50% {opacity: 0.6;
transform: translate(-50%, -50%) scale(1.2);}}
        </style> `}
          ></Script>
        </div>
      </div>
      <div className="footer-container6">
        <div className="footer-container7">
          <Script
            html={`<script defer data-name="footer">
(function(){
  // Enhanced interactive effects for footer links
  const footerNavLinks = document.querySelectorAll(".footer__nav-link")

  footerNavLinks.forEach((link) => {
    link.addEventListener("mouseenter", function () {
      const svg = this.querySelector("svg")
      if (svg) {
        svg.style.transform = "translateX(4px)"
      }
    })

    link.addEventListener("mouseleave", function () {
      const svg = this.querySelector("svg")
      if (svg) {
        svg.style.transform = "translateX(0)"
      }
    })
  })

  // Add typing cursor effect to logo text on hover
  const logoText = document.querySelector(".footer__logo-text")
  if (logoText) {
    let originalText = logoText.textContent

    logoText.parentElement.addEventListener("mouseenter", function () {
      let index = 0
      logoText.textContent = ""

      const typeInterval = setInterval(() => {
        if (index < originalText.length) {
          logoText.textContent += originalText[index]
          index++
        } else {
          clearInterval(typeInterval)
        }
      }, 80)
    })
  }

  // Parallax effect for particles based on mouse movement
  const footer = document.getElementById("footer")
  const particles = document.querySelectorAll(".footer__particle")

  if (
    footer &&
    window.matchMedia("(prefers-reduced-motion: no-preference)").matches
  ) {
    footer.addEventListener("mousemove", (e) => {
      const rect = footer.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width
      const y = (e.clientY - rect.top) / rect.height

      particles.forEach((particle, index) => {
        const speed = (index + 1) * 0.5
        const offsetX = (x - 0.5) * speed * 20
        const offsetY = (y - 0.5) * speed * 20

        particle.style.transform = \`translate(\${offsetX}px, \${offsetY}px)\`
      })
    })

    footer.addEventListener("mouseleave", () => {
      particles.forEach((particle) => {
        particle.style.transform = "translate(0, 0)"
      })
    })
  }

  // Glitch effect on social icons
  const socialLinks = document.querySelectorAll(".footer__social-link")

  socialLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      if (
        window.matchMedia("(prefers-reduced-motion: no-preference)").matches
      ) {
        this.style.animation = "footerGlitch 0.3s ease-in-out"

        setTimeout(() => {
          this.style.animation = ""
        }, 300)
      }
    })
  })

  // Add glitch keyframes dynamically
  const glitchStyles = document.createElement("style")
  glitchStyles.textContent = \`
  @keyframes footerGlitch {
    0%, 100% { transform: translateY(-4px); }
    25% { transform: translate(-2px, -2px); }
    50% { transform: translate(2px, -6px); }
    75% { transform: translate(-2px, -3px); }
  }
\`
  document.head.appendChild(glitchStyles)

  // Add scan line direction change on scroll
  let lastScrollY = window.pageYOffset

  window.addEventListener(
    "scroll",
    () => {
      const scanline = document.querySelector(".footer__scanline")
      if (!scanline) return

      const currentScrollY = window.pageYOffset
      const scrollDirection = currentScrollY > lastScrollY ? "down" : "up"

      if (scrollDirection === "down") {
        scanline.style.animationDirection = "normal"
      } else {
        scanline.style.animationDirection = "reverse"
      }

      lastScrollY = currentScrollY
    },
    { passive: true }
  )
})()
</script>`}
          ></Script>
        </div>
      </div>
    </div>
  )
}

export default Footer

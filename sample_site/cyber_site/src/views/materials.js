import React from 'react'

import Script from 'dangerous-html/react'
import { Helmet } from 'react-helmet'

import Navigation from '../components/navigation'
import Footer from '../components/footer'
import './materials.css'

const Materials = (props) => {
  return (
    <div className="materials-container1">
      <Helmet>
        <title>Materials - Liquid Even Magpie</title>
        <meta property="og:title" content="Materials - Liquid Even Magpie" />
      </Helmet>
      <Navigation></Navigation>
      <div className="materials-container2">
        <div className="materials-container3">
          <Script
            html={`<style>
@media (prefers-reduced-motion: reduce) {
*, *::before, *::after {
  animation-duration: 0.01ms !important;
  animation-iteration-count: 1 !important;
  transition-duration: 0.01ms !important;
}
}
</style>`}
          ></Script>
        </div>
      </div>
      <section
        role="region"
        aria-labelledby="dashboard-heading"
        className="dashboard-section"
      >
        <div className="dashboard-container">
          <div className="summary-strip">
            <div className="summary-left">
              <h1 id="dashboard-heading" className="hero-title">
                {' '}
                EventSync Materials Dashboard
                <span
                  dangerouslySetInnerHTML={{
                    __html: ' ',
                  }}
                />
              </h1>
              <p className="section-subtitle">
                リアルタイムでイベントを掌握する
              </p>
            </div>
            <div className="summary-right">
              <div aria-live="polite" className="live-clock">
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
                    <path d="M12 6v6l4 2"></path>
                    <circle r="10" cx="12" cy="12"></circle>
                  </g>
                </svg>
                <span id="live-time" className="time-display">
                  14:35:42
                </span>
              </div>
              <div className="summary-metrics">
                <div className="metric-chip">
                  <svg
                    width="18"
                    xmlns="http://www.w3.org/2000/svg"
                    height="18"
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
                  <span>12名稼働</span>
                </div>
                <div className="critical metric-chip">
                  <svg
                    width="18"
                    xmlns="http://www.w3.org/2000/svg"
                    height="18"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M12 13h.01M12 6v3M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></path>
                  </svg>
                  <span>3件アラート</span>
                </div>
              </div>
            </div>
          </div>
          <div
            role="region"
            aria-label="Schedule timeline"
            className="timeline-band"
          >
            <div className="timeline-scroll">
              <div aria-hidden="true" className="timeline-focus-line"></div>
              <div className="timeline-segments">
                <div
                  data-time="13:00"
                  aria-label="準備完了"
                  className="completed timeline-segment"
                >
                  <span className="segment-label">準備</span>
                  <span className="segment-time">13:00</span>
                </div>
                <div
                  data-time="14:30"
                  aria-label="本番進行中"
                  className="active timeline-segment"
                >
                  <span className="segment-label">本番</span>
                  <span className="segment-time">14:30</span>
                  <div className="active-indicator"></div>
                </div>
                <div
                  data-time="16:00"
                  aria-label="撤収予定"
                  className="upcoming timeline-segment"
                >
                  <span className="segment-label">撤収</span>
                  <span className="segment-time">16:00</span>
                </div>
                <div
                  data-time="18:00"
                  aria-label="完了予定"
                  className="upcoming timeline-segment"
                >
                  <span className="segment-label">完了</span>
                  <span className="segment-time">18:00</span>
                </div>
              </div>
            </div>
          </div>
          <div className="dashboard-main">
            <div className="members-column">
              <div className="column-header">
                <h2 className="section-title">メンバー</h2>
                <button
                  aria-label="メンバーを追加"
                  className="btn-sm btn btn-primary"
                >
                  <svg
                    width="16"
                    xmlns="http://www.w3.org/2000/svg"
                    height="16"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M5 12h14m-7-7v14"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></path>
                  </svg>
                  <span>
                    {' '}
                    追加
                    <span
                      dangerouslySetInnerHTML={{
                        __html: ' ',
                      }}
                    />
                  </span>
                </button>
              </div>
              <ul role="list" className="members-list">
                <li
                  role="button"
                  tabindex="0"
                  aria-label="田中太郎 - ディレクター - 作業中"
                  className="active member-item"
                >
                  <div className="member-avatar">
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
                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                        <circle r="4" cx="12" cy="7"></circle>
                      </g>
                    </svg>
                  </div>
                  <div className="member-info">
                    <span className="member-name">田中太郎</span>
                    <span className="member-role">ディレクター</span>
                  </div>
                  <div className="status-active member-status"></div>
                </li>
                <li
                  role="button"
                  tabindex="0"
                  aria-label="佐藤花子 - スタッフ - 待機"
                  className="waiting member-item"
                >
                  <div className="member-avatar">
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
                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                        <circle r="4" cx="12" cy="7"></circle>
                      </g>
                    </svg>
                  </div>
                  <div className="member-info">
                    <span className="member-name">佐藤花子</span>
                    <span className="member-role">スタッフ</span>
                  </div>
                  <div className="status-waiting member-status"></div>
                </li>
                <li
                  role="button"
                  tabindex="0"
                  aria-label="鈴木一郎 - テクニカル - 作業中"
                  className="active member-item"
                >
                  <div className="member-avatar">
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
                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                        <circle r="4" cx="12" cy="7"></circle>
                      </g>
                    </svg>
                  </div>
                  <div className="member-info">
                    <span className="member-name">鈴木一郎</span>
                    <span className="member-role">テクニカル</span>
                  </div>
                  <div className="status-active member-status"></div>
                </li>
                <li
                  role="button"
                  tabindex="0"
                  aria-label="山田次郎 - サポート - 要支援"
                  className="support member-item"
                >
                  <div className="member-avatar">
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
                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                        <circle r="4" cx="12" cy="7"></circle>
                      </g>
                    </svg>
                  </div>
                  <div className="member-info">
                    <span className="member-name">山田次郎</span>
                    <span className="member-role">サポート</span>
                  </div>
                  <div className="status-support member-status"></div>
                </li>
              </ul>
            </div>
            <div className="materials-column">
              <div className="column-header">
                <h2 className="section-title">資材</h2>
                <div className="header-actions">
                  <div role="search" className="search-box">
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
                        <path d="m21 21l-4.34-4.34"></path>
                        <circle r="8" cx="11" cy="11"></circle>
                      </g>
                    </svg>
                    <input
                      type="search"
                      aria-label="資材を検索"
                      placeholder="検索..."
                    />
                  </div>
                  <button
                    aria-label="資材を追加"
                    className="btn-sm btn btn-primary"
                  >
                    <svg
                      width="16"
                      xmlns="http://www.w3.org/2000/svg"
                      height="16"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M5 12h14m-7-7v14"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      ></path>
                    </svg>
                    <span>
                      {' '}
                      追加
                      <span
                        dangerouslySetInnerHTML={{
                          __html: ' ',
                        }}
                      />
                    </span>
                  </button>
                </div>
              </div>
              <ul role="list" aria-live="polite" className="materials-list">
                <li
                  role="listitem"
                  tabindex="0"
                  aria-label="マイク - 3個在庫 - 低在庫アラート"
                  className="material-item low-stock"
                >
                  <div className="material-icon">
                    <svg
                      width="24"
                      xmlns="http://www.w3.org/2000/svg"
                      height="24"
                      viewBox="0 0 24 24"
                    >
                      <g
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73zm1 .27V12"></path>
                        <path d="M3.29 7L12 12l8.71-5M7.5 4.27l9 5.15"></path>
                      </g>
                    </svg>
                  </div>
                  <div className="material-details">
                    <span className="material-name">マイク</span>
                    <span className="material-category">音響機材</span>
                  </div>
                  <div className="material-stock">
                    <span className="stock-count alert">3</span>
                    <span className="stock-label">個</span>
                  </div>
                  <div aria-label="低在庫" className="material-alert">
                    <svg
                      width="16"
                      xmlns="http://www.w3.org/2000/svg"
                      height="16"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M12 13h.01M12 6v3M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      ></path>
                    </svg>
                  </div>
                </li>
                <li
                  role="listitem"
                  tabindex="0"
                  aria-label="モニター - 8台在庫"
                  className="material-item"
                >
                  <div className="material-icon">
                    <svg
                      width="24"
                      xmlns="http://www.w3.org/2000/svg"
                      height="24"
                      viewBox="0 0 24 24"
                    >
                      <g
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect x="2" y="3" rx="2" width="20" height="14"></rect>
                        <path d="M8 21h8m-4-4v4"></path>
                      </g>
                    </svg>
                  </div>
                  <div className="material-details">
                    <span className="material-name">モニター</span>
                    <span className="material-category">映像機材</span>
                  </div>
                  <div className="material-stock">
                    <span className="stock-count">8</span>
                    <span className="stock-label">台</span>
                  </div>
                </li>
                <li
                  role="listitem"
                  tabindex="0"
                  aria-label="ケーブル - 45本在庫"
                  className="material-item"
                >
                  <div className="material-icon">
                    <svg
                      width="24"
                      xmlns="http://www.w3.org/2000/svg"
                      height="24"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      ></path>
                    </svg>
                  </div>
                  <div className="material-details">
                    <span className="material-name">ケーブル</span>
                    <span className="material-category">消耗品</span>
                  </div>
                  <div className="material-stock">
                    <span className="stock-count">45</span>
                    <span className="stock-label">本</span>
                  </div>
                </li>
                <li
                  role="listitem"
                  tabindex="0"
                  aria-label="椅子 - 12脚在庫 - 低在庫アラート"
                  className="material-item low-stock"
                >
                  <div className="material-icon">
                    <svg
                      width="24"
                      xmlns="http://www.w3.org/2000/svg"
                      height="24"
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
                  </div>
                  <div className="material-details">
                    <span className="material-name">椅子</span>
                    <span className="material-category">備品</span>
                  </div>
                  <div className="material-stock">
                    <span className="stock-count alert">12</span>
                    <span className="stock-label">脚</span>
                  </div>
                  <div aria-label="低在庫" className="material-alert">
                    <svg
                      width="16"
                      xmlns="http://www.w3.org/2000/svg"
                      height="16"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M12 13h.01M12 6v3M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      ></path>
                    </svg>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
      <section
        role="region"
        aria-labelledby="schedule-heading"
        className="schedule-section"
      >
        <div className="schedule-container">
          <div className="gantt-timeline">
            <div className="gantt-header">
              <h2 id="schedule-heading" className="section-title">
                {' '}
                イベントスケジュール
                <span
                  dangerouslySetInnerHTML={{
                    __html: ' ',
                  }}
                />
              </h2>
              <div className="gantt-controls">
                <button
                  aria-label="時間軸をズーム"
                  className="btn-outline btn-sm btn"
                >
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
                      <path d="m21 21l-4.34-4.34"></path>
                      <circle r="8" cx="11" cy="11"></circle>
                    </g>
                  </svg>
                </button>
                <button aria-label="設定" className="btn-outline btn-sm btn">
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
                      <path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0a2.34 2.34 0 0 0 3.319 1.915a2.34 2.34 0 0 1 2.33 4.033a2.34 2.34 0 0 0 0 3.831a2.34 2.34 0 0 1-2.33 4.033a2.34 2.34 0 0 0-3.319 1.915a2.34 2.34 0 0 1-4.659 0a2.34 2.34 0 0 0-3.32-1.915a2.34 2.34 0 0 1-2.33-4.033a2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915"></path>
                      <circle r="3" cx="12" cy="12"></circle>
                    </g>
                  </svg>
                </button>
              </div>
            </div>
            <div className="gantt-grid">
              <div className="gantt-time-axis">
                <div className="time-marker">
                  <span>13:00</span>
                </div>
                <div className="time-marker">
                  <span>14:00</span>
                </div>
                <div className="current time-marker">
                  <span>15:00</span>
                </div>
                <div className="time-marker">
                  <span>16:00</span>
                </div>
                <div className="time-marker">
                  <span>17:00</span>
                </div>
                <div className="time-marker">
                  <span>18:00</span>
                </div>
              </div>
              <div className="gantt-tracks">
                <div className="gantt-track">
                  <span className="track-label">準備フェーズ</span>
                  <div
                    aria-label="準備フェーズ完了"
                    className="materials-gantt-bar1 completed gantt-bar"
                  >
                    <span className="bar-label">セットアップ</span>
                  </div>
                </div>
                <div className="gantt-track">
                  <span className="track-label">本番フェーズ</span>
                  <div
                    aria-live="polite"
                    aria-label="本番進行中"
                    className="materials-gantt-bar2 active gantt-bar"
                  >
                    <span className="bar-label">イベント実施</span>
                    <div className="materials-progress-indicator progress-indicator"></div>
                  </div>
                </div>
                <div className="gantt-track">
                  <span className="track-label">撤収フェーズ</span>
                  <div
                    aria-label="撤収予定"
                    className="materials-gantt-bar3 upcoming gantt-bar"
                  >
                    <span className="bar-label">片付け</span>
                  </div>
                </div>
              </div>
              <div
                aria-hidden="true"
                className="materials-current-time-scrubber current-time-scrubber"
              >
                <div className="scrubber-line"></div>
                <div className="scrubber-label">
                  <span>14:35</span>
                </div>
              </div>
            </div>
          </div>
          <div className="schedule-content">
            <div className="schedule-members">
              <h3 className="section-subtitle">チームメンバー</h3>
              <ul role="list" className="compact-list">
                <li className="compact-item">
                  <div className="item-icon">
                    <svg
                      width="18"
                      xmlns="http://www.w3.org/2000/svg"
                      height="18"
                      viewBox="0 0 24 24"
                    >
                      <g
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                        <circle r="4" cx="12" cy="7"></circle>
                      </g>
                    </svg>
                  </div>
                  <div className="item-content">
                    <span className="item-title">田中太郎</span>
                    <span className="item-meta">ディレクター</span>
                  </div>
                  <div className="active status-indicator"></div>
                </li>
                <li className="compact-item">
                  <div className="item-icon">
                    <svg
                      width="18"
                      xmlns="http://www.w3.org/2000/svg"
                      height="18"
                      viewBox="0 0 24 24"
                    >
                      <g
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                        <circle r="4" cx="12" cy="7"></circle>
                      </g>
                    </svg>
                  </div>
                  <div className="item-content">
                    <span className="item-title">佐藤花子</span>
                    <span className="item-meta">音響担当</span>
                  </div>
                  <div className="active status-indicator"></div>
                </li>
                <li className="compact-item">
                  <div className="item-icon">
                    <svg
                      width="18"
                      xmlns="http://www.w3.org/2000/svg"
                      height="18"
                      viewBox="0 0 24 24"
                    >
                      <g
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                        <circle r="4" cx="12" cy="7"></circle>
                      </g>
                    </svg>
                  </div>
                  <div className="item-content">
                    <span className="item-title">鈴木一郎</span>
                    <span className="item-meta">照明担当</span>
                  </div>
                  <div className="waiting status-indicator"></div>
                </li>
              </ul>
            </div>
            <div className="schedule-materials">
              <h3 className="section-subtitle">使用資材</h3>
              <div className="materials-grid">
                <div className="material-card">
                  <div className="card-header">
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
                        <rect x="2" y="3" rx="2" width="20" height="14"></rect>
                        <path d="M8 21h8m-4-4v4"></path>
                      </g>
                    </svg>
                    <span className="card-title">モニター</span>
                  </div>
                  <div className="card-body">
                    <div className="stock-display">
                      <span className="stock-number">8</span>
                      <span className="stock-unit">台</span>
                    </div>
                    <span className="category-badge">映像機材</span>
                  </div>
                </div>
                <div className="material-card alert">
                  <div className="card-header">
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
                        <path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73zm1 .27V12"></path>
                        <path d="M3.29 7L12 12l8.71-5M7.5 4.27l9 5.15"></path>
                      </g>
                    </svg>
                    <span className="card-title">マイク</span>
                  </div>
                  <div className="card-body">
                    <div className="stock-display">
                      <span className="stock-number alert">3</span>
                      <span className="stock-unit">個</span>
                    </div>
                    <span className="alert category-badge">低在庫</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section
        role="region"
        aria-labelledby="team-heading"
        className="team-section"
      >
        <div className="team-container">
          <div className="team-header">
            <div className="header-content">
              <h2 id="team-heading" className="section-title">
                チーム管理
              </h2>
              <p className="section-subtitle">
                現場を動かすオペレーションの中枢
              </p>
            </div>
            <button aria-label="メンバーを追加" className="btn btn-primary">
              <svg
                width="20"
                xmlns="http://www.w3.org/2000/svg"
                height="20"
                viewBox="0 0 24 24"
              >
                <path
                  d="M5 12h14m-7-7v14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                ></path>
              </svg>
              <span>
                {' '}
                メンバーを追加
                <span
                  dangerouslySetInnerHTML={{
                    __html: ' ',
                  }}
                />
              </span>
            </button>
          </div>
          <div className="team-main">
            <div className="member-list-column">
              <div className="search-filter">
                <div className="search-input">
                  <svg
                    width="18"
                    xmlns="http://www.w3.org/2000/svg"
                    height="18"
                    viewBox="0 0 24 24"
                  >
                    <g
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m21 21l-4.34-4.34"></path>
                      <circle r="8" cx="11" cy="11"></circle>
                    </g>
                  </svg>
                  <input
                    type="search"
                    aria-label="メンバーを検索"
                    placeholder="メンバーを検索..."
                  />
                </div>
              </div>
              <ul role="list" className="member-rows">
                <li
                  role="button"
                  tabindex="0"
                  aria-pressed="false"
                  className="active member-row"
                >
                  <div className="member-avatar-circle">
                    <span>TT</span>
                  </div>
                  <div className="member-data">
                    <span className="member-name-text">田中太郎</span>
                    <span className="member-role-text">
                      イベントディレクター
                    </span>
                  </div>
                  <div
                    aria-label="作業中"
                    className="status-active member-status-dot"
                  ></div>
                </li>
                <li
                  role="button"
                  tabindex="0"
                  aria-pressed="false"
                  className="member-row"
                >
                  <div className="member-avatar-circle">
                    <span>SH</span>
                  </div>
                  <div className="member-data">
                    <span className="member-name-text">佐藤花子</span>
                    <span className="member-role-text">音響エンジニア</span>
                  </div>
                  <div
                    aria-label="作業中"
                    className="status-active member-status-dot"
                  ></div>
                </li>
                <li
                  role="button"
                  tabindex="0"
                  aria-pressed="false"
                  className="member-row"
                >
                  <div className="member-avatar-circle">
                    <span>SI</span>
                  </div>
                  <div className="member-data">
                    <span className="member-name-text">鈴木一郎</span>
                    <span className="member-role-text">照明技師</span>
                  </div>
                  <div
                    aria-label="待機"
                    className="status-waiting member-status-dot"
                  ></div>
                </li>
                <li
                  role="button"
                  tabindex="0"
                  aria-pressed="false"
                  className="member-row"
                >
                  <div className="member-avatar-circle">
                    <span>YJ</span>
                  </div>
                  <div className="member-data">
                    <span className="member-name-text">山田次郎</span>
                    <span className="member-role-text">設営スタッフ</span>
                  </div>
                  <div
                    aria-label="要支援"
                    className="member-status-dot status-support"
                  ></div>
                </li>
                <li
                  role="button"
                  tabindex="0"
                  aria-pressed="false"
                  className="member-row"
                >
                  <div className="member-avatar-circle">
                    <span>KM</span>
                  </div>
                  <div className="member-data">
                    <span className="member-name-text">加藤美咲</span>
                    <span className="member-role-text">受付担当</span>
                  </div>
                  <div
                    aria-label="作業中"
                    className="status-active member-status-dot"
                  ></div>
                </li>
                <li
                  role="button"
                  tabindex="0"
                  aria-pressed="false"
                  className="member-row"
                >
                  <div className="member-avatar-circle">
                    <span>IT</span>
                  </div>
                  <div className="member-data">
                    <span className="member-name-text">伊藤拓也</span>
                    <span className="member-role-text">映像オペレーター</span>
                  </div>
                  <div
                    aria-label="待機"
                    className="status-waiting member-status-dot"
                  ></div>
                </li>
              </ul>
            </div>
            <div className="role-cards-column">
              <h3 className="section-subtitle">役職別アクション</h3>
              <div className="role-grid">
                <div className="role-card">
                  <div className="role-badge director">
                    <svg
                      width="20"
                      xmlns="http://www.w3.org/2000/svg"
                      height="20"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.12 2.12 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.12 2.12 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.12 2.12 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.12 2.12 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.12 2.12 0 0 0 1.597-1.16z"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      ></path>
                    </svg>
                    <span>ディレクター</span>
                  </div>
                  <p className="role-description">イベント全体の統括</p>
                  <div className="role-stats">
                    <span className="stat-item">3名配置</span>
                    <span className="stat-item">優先度: 高</span>
                  </div>
                </div>
                <div className="role-card">
                  <div className="technical role-badge">
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
                        <path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0a2.34 2.34 0 0 0 3.319 1.915a2.34 2.34 0 0 1 2.33 4.033a2.34 2.34 0 0 0 0 3.831a2.34 2.34 0 0 1-2.33 4.033a2.34 2.34 0 0 0-3.319 1.915a2.34 2.34 0 0 1-4.659 0a2.34 2.34 0 0 0-3.32-1.915a2.34 2.34 0 0 1-2.33-4.033a2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915"></path>
                        <circle r="3" cx="12" cy="12"></circle>
                      </g>
                    </svg>
                    <span>テクニカル</span>
                  </div>
                  <p className="role-description">機材運用・トラブル対応</p>
                  <div className="role-stats">
                    <span className="stat-item">5名配置</span>
                    <span className="stat-item">優先度: 高</span>
                  </div>
                </div>
                <div className="role-card">
                  <div className="staff role-badge">
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
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M16 3.128a4 4 0 0 1 0 7.744M22 21v-2a4 4 0 0 0-3-3.87"></path>
                        <circle r="4" cx="9" cy="7"></circle>
                      </g>
                    </svg>
                    <span>スタッフ</span>
                  </div>
                  <p className="role-description">会場運営・来場者対応</p>
                  <div className="role-stats">
                    <span className="stat-item">4名配置</span>
                    <span className="stat-item">優先度: 中</span>
                  </div>
                </div>
                <div className="role-card">
                  <div className="support role-badge">
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
                        <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                        <rect x="2" y="6" rx="2" width="20" height="14"></rect>
                      </g>
                    </svg>
                    <span>サポート</span>
                  </div>
                  <p className="role-description">バックアップ・補助業務</p>
                  <div className="role-stats">
                    <span className="stat-item">2名配置</span>
                    <span className="stat-item">優先度: 中</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section
        role="region"
        aria-labelledby="materials-heading"
        className="materials-section"
      >
        <div className="materials-container">
          <div className="materials-featured-bar">
            <div className="summary-cards">
              <div className="summary-card">
                <span className="summary-label">総資材数</span>
                <span className="summary-value">127</span>
              </div>
              <div className="summary-card alert">
                <span className="summary-label">低在庫</span>
                <span className="summary-value">3</span>
              </div>
              <div className="summary-card">
                <span className="summary-label">カテゴリ</span>
                <span className="summary-value">8</span>
              </div>
            </div>
            <div role="search" className="global-search">
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
                  <path d="m21 21l-4.34-4.34"></path>
                  <circle r="8" cx="11" cy="11"></circle>
                </g>
              </svg>
              <input
                type="search"
                aria-label="資材を検索"
                placeholder="資材を検索..."
              />
            </div>
          </div>
          <div className="materials-main">
            <div className="inventory-column">
              <div className="inventory-header">
                <h2 id="materials-heading" className="section-title">
                  資材在庫
                </h2>
                <div className="view-controls">
                  <button
                    aria-label="リスト表示"
                    className="btn-outline btn-sm btn"
                  >
                    <svg
                      width="16"
                      xmlns="http://www.w3.org/2000/svg"
                      height="16"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M2 5h20M6 12h12m-9 7h6"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      ></path>
                    </svg>
                  </button>
                  <button
                    aria-label="ソート"
                    className="btn-outline btn-sm btn"
                  >
                    <svg
                      width="16"
                      xmlns="http://www.w3.org/2000/svg"
                      height="16"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="m18 15l-6-6l-6 6"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      ></path>
                    </svg>
                  </button>
                </div>
              </div>
              <ul role="list" aria-live="polite" className="inventory-list">
                <li
                  role="listitem"
                  tabindex="0"
                  aria-label="マイク - カテゴリ: 音響機材 - 在庫: 3個 - 低在庫アラート"
                  className="low-stock inventory-item"
                >
                  <div role="link" aria-haspopup="dialog" className="item-left">
                    <div className="item-icon-box">
                      <svg
                        width="24"
                        xmlns="http://www.w3.org/2000/svg"
                        height="24"
                        viewBox="0 0 24 24"
                      >
                        <g
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73zm1 .27V12"></path>
                          <path d="M3.29 7L12 12l8.71-5M7.5 4.27l9 5.15"></path>
                        </g>
                      </svg>
                    </div>
                    <div className="item-text">
                      <span className="item-name">マイク</span>
                      <span className="item-metadata">音響機材 / A-102</span>
                    </div>
                  </div>
                  <div className="item-right">
                    <div className="stock-counter">
                      <span className="alert counter-number">3</span>
                      <span className="counter-unit">個</span>
                    </div>
                    <div className="alert-icon">
                      <svg
                        width="18"
                        xmlns="http://www.w3.org/2000/svg"
                        height="18"
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="M12 13h.01M12 6v3M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        ></path>
                      </svg>
                    </div>
                    <button
                      aria-label="補充"
                      className="quick-action btn-sm btn btn-primary"
                    >
                      <svg
                        width="16"
                        xmlns="http://www.w3.org/2000/svg"
                        height="16"
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="M5 12h14m-7-7v14"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        ></path>
                      </svg>
                    </button>
                  </div>
                </li>
                <li
                  role="listitem"
                  tabindex="0"
                  aria-label="モニター - カテゴリ: 映像機材 - 在庫: 8台"
                  className="inventory-item"
                >
                  <div role="link" aria-haspopup="dialog" className="item-left">
                    <div className="item-icon-box">
                      <svg
                        width="24"
                        xmlns="http://www.w3.org/2000/svg"
                        height="24"
                        viewBox="0 0 24 24"
                      >
                        <g
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <rect
                            x="2"
                            y="3"
                            rx="2"
                            width="20"
                            height="14"
                          ></rect>
                          <path d="M8 21h8m-4-4v4"></path>
                        </g>
                      </svg>
                    </div>
                    <div className="item-text">
                      <span className="item-name">モニター</span>
                      <span className="item-metadata">映像機材 / V-205</span>
                    </div>
                  </div>
                  <div className="item-right">
                    <div className="stock-counter">
                      <span className="counter-number">8</span>
                      <span className="counter-unit">台</span>
                    </div>
                    <button
                      aria-label="補充"
                      className="quick-action btn-sm btn btn-primary"
                    >
                      <svg
                        width="16"
                        xmlns="http://www.w3.org/2000/svg"
                        height="16"
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="M5 12h14m-7-7v14"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        ></path>
                      </svg>
                    </button>
                  </div>
                </li>
                <li
                  role="listitem"
                  tabindex="0"
                  aria-label="ケーブル - カテゴリ: 消耗品 - 在庫: 45本"
                  className="inventory-item"
                >
                  <div role="link" aria-haspopup="dialog" className="item-left">
                    <div className="item-icon-box">
                      <svg
                        width="24"
                        xmlns="http://www.w3.org/2000/svg"
                        height="24"
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        ></path>
                      </svg>
                    </div>
                    <div className="item-text">
                      <span className="item-name">ケーブル</span>
                      <span className="item-metadata">消耗品 / C-412</span>
                    </div>
                  </div>
                  <div className="item-right">
                    <div className="stock-counter">
                      <span className="counter-number">45</span>
                      <span className="counter-unit">本</span>
                    </div>
                    <button
                      aria-label="補充"
                      className="quick-action btn-sm btn btn-primary"
                    >
                      <svg
                        width="16"
                        xmlns="http://www.w3.org/2000/svg"
                        height="16"
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="M5 12h14m-7-7v14"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        ></path>
                      </svg>
                    </button>
                  </div>
                </li>
                <li
                  role="listitem"
                  tabindex="0"
                  aria-label="椅子 - カテゴリ: 備品 - 在庫: 12脚 - 低在庫アラート"
                  className="low-stock inventory-item"
                >
                  <div role="link" aria-haspopup="dialog" className="item-left">
                    <div className="item-icon-box">
                      <svg
                        width="24"
                        xmlns="http://www.w3.org/2000/svg"
                        height="24"
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
                    </div>
                    <div className="item-text">
                      <span className="item-name">椅子</span>
                      <span className="item-metadata">備品 / F-308</span>
                    </div>
                  </div>
                  <div className="item-right">
                    <div className="stock-counter">
                      <span className="alert counter-number">12</span>
                      <span className="counter-unit">脚</span>
                    </div>
                    <div className="alert-icon">
                      <svg
                        width="18"
                        xmlns="http://www.w3.org/2000/svg"
                        height="18"
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="M12 13h.01M12 6v3M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        ></path>
                      </svg>
                    </div>
                    <button
                      aria-label="補充"
                      className="quick-action btn-sm btn btn-primary"
                    >
                      <svg
                        width="16"
                        xmlns="http://www.w3.org/2000/svg"
                        height="16"
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="M5 12h14m-7-7v14"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        ></path>
                      </svg>
                    </button>
                  </div>
                </li>
                <li
                  role="listitem"
                  tabindex="0"
                  aria-label="スピーカー - カテゴリ: 音響機材 - 在庫: 6台"
                  className="inventory-item"
                >
                  <div role="link" aria-haspopup="dialog" className="item-left">
                    <div className="item-icon-box">
                      <svg
                        width="24"
                        xmlns="http://www.w3.org/2000/svg"
                        height="24"
                        viewBox="0 0 24 24"
                      >
                        <g
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                          <rect
                            x="2"
                            y="6"
                            rx="2"
                            width="20"
                            height="14"
                          ></rect>
                        </g>
                      </svg>
                    </div>
                    <div className="item-text">
                      <span className="item-name">スピーカー</span>
                      <span className="item-metadata">音響機材 / A-156</span>
                    </div>
                  </div>
                  <div className="item-right">
                    <div className="stock-counter">
                      <span className="counter-number">6</span>
                      <span className="counter-unit">台</span>
                    </div>
                    <button
                      aria-label="補充"
                      className="quick-action btn-sm btn btn-primary"
                    >
                      <svg
                        width="16"
                        xmlns="http://www.w3.org/2000/svg"
                        height="16"
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="M5 12h14m-7-7v14"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        ></path>
                      </svg>
                    </button>
                  </div>
                </li>
                <li
                  role="listitem"
                  tabindex="0"
                  aria-label="照明機材 - カテゴリ: 照明 - 在庫: 15台"
                  className="inventory-item"
                >
                  <div role="link" aria-haspopup="dialog" className="item-left">
                    <div className="item-icon-box">
                      <svg
                        width="24"
                        xmlns="http://www.w3.org/2000/svg"
                        height="24"
                        viewBox="0 0 24 24"
                      >
                        <g
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73zm1 .27V12"></path>
                          <path d="M3.29 7L12 12l8.71-5M7.5 4.27l9 5.15"></path>
                        </g>
                      </svg>
                    </div>
                    <div className="item-text">
                      <span className="item-name">照明機材</span>
                      <span className="item-metadata">照明 / L-211</span>
                    </div>
                  </div>
                  <div className="item-right">
                    <div className="stock-counter">
                      <span className="counter-number">15</span>
                      <span className="counter-unit">台</span>
                    </div>
                    <button
                      aria-label="補充"
                      className="quick-action btn-sm btn btn-primary"
                    >
                      <svg
                        width="16"
                        xmlns="http://www.w3.org/2000/svg"
                        height="16"
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="M5 12h14m-7-7v14"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        ></path>
                      </svg>
                    </button>
                  </div>
                </li>
              </ul>
            </div>
            <div className="controls-column">
              <div className="control-panel">
                <h3 className="section-subtitle">フィルター</h3>
                <div className="filter-group">
                  <button
                    aria-pressed="true"
                    aria-controls="inventory-list"
                    className="active filter-btn"
                  >
                    <svg
                      width="16"
                      xmlns="http://www.w3.org/2000/svg"
                      height="16"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M20 6L9 17l-5-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      ></path>
                    </svg>
                    <span>
                      {' '}
                      全て表示
                      <span
                        dangerouslySetInnerHTML={{
                          __html: ' ',
                        }}
                      />
                    </span>
                  </button>
                  <button
                    aria-pressed="false"
                    aria-controls="inventory-list"
                    className="filter-btn"
                  >
                    {' '}
                    音響機材
                    <span
                      dangerouslySetInnerHTML={{
                        __html: ' ',
                      }}
                    />
                  </button>
                  <button
                    aria-pressed="false"
                    aria-controls="inventory-list"
                    className="filter-btn"
                  >
                    {' '}
                    映像機材
                    <span
                      dangerouslySetInnerHTML={{
                        __html: ' ',
                      }}
                    />
                  </button>
                  <button
                    aria-pressed="false"
                    aria-controls="inventory-list"
                    className="filter-btn"
                  >
                    {' '}
                    照明
                    <span
                      dangerouslySetInnerHTML={{
                        __html: ' ',
                      }}
                    />
                  </button>
                  <button
                    aria-pressed="false"
                    aria-controls="inventory-list"
                    className="filter-btn"
                  >
                    {' '}
                    備品
                    <span
                      dangerouslySetInnerHTML={{
                        __html: ' ',
                      }}
                    />
                  </button>
                  <button
                    aria-pressed="false"
                    aria-controls="inventory-list"
                    className="filter-btn"
                  >
                    {' '}
                    消耗品
                    <span
                      dangerouslySetInnerHTML={{
                        __html: ' ',
                      }}
                    />
                  </button>
                </div>
              </div>
              <div className="control-panel">
                <h3 className="section-subtitle">クイック追加</h3>
                <form className="quick-add-form">
                  <div className="form-field">
                    <label htmlFor="material-name">資材名</label>
                    <input
                      type="text"
                      id="material-name"
                      placeholder="例: マイク"
                    />
                  </div>
                  <div className="form-field">
                    <label htmlFor="material-quantity">数量</label>
                    <input
                      type="number"
                      id="material-quantity"
                      min="0"
                      placeholder="0"
                    />
                  </div>
                  <div className="form-field">
                    <label htmlFor="material-category">カテゴリ</label>
                    <select id="material-category">
                      <option value="true">選択してください</option>
                      <option value="audio">音響機材</option>
                      <option value="video">映像機材</option>
                      <option value="lighting">照明</option>
                      <option value="furniture">備品</option>
                      <option value="consumables">消耗品</option>
                    </select>
                  </div>
                  <button type="submit" className="btn btn-primary">
                    <svg
                      width="16"
                      xmlns="http://www.w3.org/2000/svg"
                      height="16"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M5 12h14m-7-7v14"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      ></path>
                    </svg>
                    <span>
                      {' '}
                      追加
                      <span
                        dangerouslySetInnerHTML={{
                          __html: ' ',
                        }}
                      />
                    </span>
                  </button>
                </form>
              </div>
              <div className="alerts-panel control-panel">
                <h3 className="section-subtitle">アラート</h3>
                <div className="alerts-list">
                  <div className="alert-item critical">
                    <div className="alert-icon-wrapper">
                      <svg
                        width="18"
                        xmlns="http://www.w3.org/2000/svg"
                        height="18"
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="M12 13h.01M12 6v3M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        ></path>
                      </svg>
                    </div>
                    <div className="alert-text">
                      <span className="alert-title">マイク低在庫</span>
                      <span className="alert-meta">残り3個</span>
                    </div>
                  </div>
                  <div className="warning alert-item">
                    <div className="alert-icon-wrapper">
                      <svg
                        width="18"
                        xmlns="http://www.w3.org/2000/svg"
                        height="18"
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="M12 13h.01M12 6v3M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        ></path>
                      </svg>
                    </div>
                    <div className="alert-text">
                      <span className="alert-title">椅子在庫注意</span>
                      <span className="alert-meta">残り12脚</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section
        role="region"
        aria-labelledby="filters-heading"
        className="filters-section"
      >
        <div className="filters-container">
          <div className="compact-schedule-band">
            <div className="schedule-status">
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
                  <path d="M12 6v6l4 2"></path>
                  <circle r="10" cx="12" cy="12"></circle>
                </g>
              </svg>
              <span className="status-text">本番進行中</span>
              <span className="status-time">14:35:42</span>
            </div>
            <div className="schedule-progress">
              <div className="progress-bar">
                <div className="materials-progress-fill progress-fill"></div>
              </div>
              <span className="progress-label">60% 完了</span>
            </div>
          </div>
          <div className="filters-main">
            <div className="compact-members">
              <h3 className="section-subtitle">メンバー</h3>
              <ul role="list" className="compact-member-list">
                <li className="compact-member-item">
                  <div className="member-initial">
                    <span>TT</span>
                  </div>
                  <span className="member-quick-name">田中太郎</span>
                  <div className="active status-indicator"></div>
                </li>
                <li className="compact-member-item">
                  <div className="member-initial">
                    <span>SH</span>
                  </div>
                  <span className="member-quick-name">佐藤花子</span>
                  <div className="active status-indicator"></div>
                </li>
                <li className="compact-member-item">
                  <div className="member-initial">
                    <span>SI</span>
                  </div>
                  <span className="member-quick-name">鈴木一郎</span>
                  <div className="waiting status-indicator"></div>
                </li>
              </ul>
            </div>
            <div className="compact-materials">
              <h3 className="section-subtitle">資材一覧</h3>
              <div className="materials-compact-grid">
                <div className="compact-material-row">
                  <span className="material-compact-name">マイク</span>
                  <span className="alert material-compact-stock">3個</span>
                </div>
                <div className="compact-material-row">
                  <span className="material-compact-name">モニター</span>
                  <span className="material-compact-stock">8台</span>
                </div>
                <div className="compact-material-row">
                  <span className="material-compact-name">ケーブル</span>
                  <span className="material-compact-stock">45本</span>
                </div>
                <div className="compact-material-row">
                  <span className="material-compact-name">椅子</span>
                  <span className="alert material-compact-stock">12脚</span>
                </div>
                <div className="compact-material-row">
                  <span className="material-compact-name">スピーカー</span>
                  <span className="material-compact-stock">6台</span>
                </div>
                <div className="compact-material-row">
                  <span className="material-compact-name">照明機材</span>
                  <span className="material-compact-stock">15台</span>
                </div>
              </div>
            </div>
            <div className="filters-alerts-panel">
              <div className="panel-section">
                <h3 id="filters-heading" className="section-subtitle">
                  フィルター設定
                </h3>
                <div className="filter-controls">
                  <div className="filter-toggle">
                    <input type="checkbox" id="filter-all" checked="true" />
                    <label htmlFor="filter-all">全て表示</label>
                  </div>
                  <div className="filter-toggle">
                    <input type="checkbox" id="filter-audio" />
                    <label htmlFor="filter-audio">音響機材</label>
                  </div>
                  <div className="filter-toggle">
                    <input type="checkbox" id="filter-video" />
                    <label htmlFor="filter-video">映像機材</label>
                  </div>
                  <div className="filter-toggle">
                    <input type="checkbox" id="filter-lighting" />
                    <label htmlFor="filter-lighting">照明</label>
                  </div>
                  <div className="filter-toggle">
                    <input type="checkbox" id="filter-furniture" />
                    <label htmlFor="filter-furniture">備品</label>
                  </div>
                </div>
              </div>
              <div aria-live="polite" className="panel-section">
                <h3 className="section-subtitle">アクティブアラート</h3>
                <div className="active-alerts">
                  <div className="compact-alert critical">
                    <div className="alert-pulse"></div>
                    <div className="alert-content">
                      <span className="alert-name">マイク低在庫</span>
                      <span className="alert-value">3個</span>
                    </div>
                  </div>
                  <div className="warning compact-alert">
                    <div className="alert-pulse"></div>
                    <div className="alert-content">
                      <span className="alert-name">椅子在庫注意</span>
                      <span className="alert-value">12脚</span>
                    </div>
                  </div>
                </div>
                <div className="alert-settings">
                  <h4 className="settings-title">しきい値設定</h4>
                  <div className="threshold-setting">
                    <label htmlFor="threshold-critical">低在庫アラート</label>
                    <input
                      type="number"
                      id="threshold-critical"
                      min="0"
                      value="5"
                    />
                  </div>
                  <div className="threshold-setting">
                    <label htmlFor="threshold-warning">在庫注意</label>
                    <input
                      type="number"
                      id="threshold-warning"
                      min="0"
                      value="15"
                    />
                  </div>
                </div>
              </div>
              <div className="panel-actions">
                <button className="btn btn-primary">設定を保存</button>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section
        role="region"
        aria-labelledby="theme-heading"
        className="theme-section"
      >
        <div className="theme-container">
          <div className="theme-workspace">
            <div className="workspace-timeline">
              <h2 id="theme-heading" className="section-title">
                サイバーダークテーマ
              </h2>
              <div className="timeline-mini">
                <div className="mini-segment completed">
                  <span>準備</span>
                </div>
                <div className="active mini-segment">
                  <span>本番</span>
                </div>
                <div className="mini-segment upcoming">
                  <span>撤収</span>
                </div>
              </div>
            </div>
            <div className="workspace-members">
              <h3 className="section-subtitle">現場メンバー</h3>
              <ul role="list" className="workspace-list">
                <li className="workspace-item">
                  <svg
                    width="18"
                    xmlns="http://www.w3.org/2000/svg"
                    height="18"
                    viewBox="0 0 24 24"
                  >
                    <g
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                      <circle r="4" cx="12" cy="7"></circle>
                    </g>
                  </svg>
                  <div className="item-info">
                    <span className="info-primary">田中太郎</span>
                    <span className="info-secondary">ディレクター</span>
                  </div>
                  <div className="active item-status"></div>
                </li>
                <li className="workspace-item">
                  <svg
                    width="18"
                    xmlns="http://www.w3.org/2000/svg"
                    height="18"
                    viewBox="0 0 24 24"
                  >
                    <g
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                      <circle r="4" cx="12" cy="7"></circle>
                    </g>
                  </svg>
                  <div className="item-info">
                    <span className="info-primary">佐藤花子</span>
                    <span className="info-secondary">音響担当</span>
                  </div>
                  <div className="active item-status"></div>
                </li>
                <li className="workspace-item">
                  <svg
                    width="18"
                    xmlns="http://www.w3.org/2000/svg"
                    height="18"
                    viewBox="0 0 24 24"
                  >
                    <g
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                      <circle r="4" cx="12" cy="7"></circle>
                    </g>
                  </svg>
                  <div className="item-info">
                    <span className="info-primary">鈴木一郎</span>
                    <span className="info-secondary">照明担当</span>
                  </div>
                  <div className="waiting item-status"></div>
                </li>
              </ul>
            </div>
          </div>
          <div className="theme-materials">
            <div className="materials-header">
              <h3 className="section-subtitle">資材カード</h3>
              <button aria-label="資材追加" className="btn-outline btn-sm btn">
                <svg
                  width="16"
                  xmlns="http://www.w3.org/2000/svg"
                  height="16"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M5 12h14m-7-7v14"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></path>
                </svg>
              </button>
            </div>
            <div className="materials-card-list">
              <div className="theme-material-card priority">
                <div className="card-icon">
                  <svg
                    width="24"
                    xmlns="http://www.w3.org/2000/svg"
                    height="24"
                    viewBox="0 0 24 24"
                  >
                    <g
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73zm1 .27V12"></path>
                      <path d="M3.29 7L12 12l8.71-5M7.5 4.27l9 5.15"></path>
                    </g>
                  </svg>
                </div>
                <div className="card-details">
                  <span className="card-name">マイク</span>
                  <span className="card-category">音響機材</span>
                </div>
                <div className="card-stock alert">
                  <span className="stock-num">3</span>
                  <span className="stock-unit">個</span>
                </div>
                <div className="priority-badge">
                  <span>優先</span>
                </div>
              </div>
              <div className="theme-material-card">
                <div className="card-icon">
                  <svg
                    width="24"
                    xmlns="http://www.w3.org/2000/svg"
                    height="24"
                    viewBox="0 0 24 24"
                  >
                    <g
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="2" y="3" rx="2" width="20" height="14"></rect>
                      <path d="M8 21h8m-4-4v4"></path>
                    </g>
                  </svg>
                </div>
                <div className="card-details">
                  <span className="card-name">モニター</span>
                  <span className="card-category">映像機材</span>
                </div>
                <div className="card-stock">
                  <span className="stock-num">8</span>
                  <span className="stock-unit">台</span>
                </div>
              </div>
              <div className="theme-material-card">
                <div className="card-icon">
                  <svg
                    width="24"
                    xmlns="http://www.w3.org/2000/svg"
                    height="24"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></path>
                  </svg>
                </div>
                <div className="card-details">
                  <span className="card-name">ケーブル</span>
                  <span className="card-category">消耗品</span>
                </div>
                <div className="card-stock">
                  <span className="stock-num">45</span>
                  <span className="stock-unit">本</span>
                </div>
              </div>
              <div className="theme-material-card priority">
                <div className="card-icon">
                  <svg
                    width="24"
                    xmlns="http://www.w3.org/2000/svg"
                    height="24"
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
                </div>
                <div className="card-details">
                  <span className="card-name">椅子</span>
                  <span className="card-category">備品</span>
                </div>
                <div className="card-stock alert">
                  <span className="stock-num">12</span>
                  <span className="stock-unit">脚</span>
                </div>
                <div className="priority-badge">
                  <span>注意</span>
                </div>
              </div>
              <div className="theme-material-card">
                <div className="card-icon">
                  <svg
                    width="24"
                    xmlns="http://www.w3.org/2000/svg"
                    height="24"
                    viewBox="0 0 24 24"
                  >
                    <g
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                      <rect x="2" y="6" rx="2" width="20" height="14"></rect>
                    </g>
                  </svg>
                </div>
                <div className="card-details">
                  <span className="card-name">スピーカー</span>
                  <span className="card-category">音響機材</span>
                </div>
                <div className="card-stock">
                  <span className="stock-num">6</span>
                  <span className="stock-unit">台</span>
                </div>
              </div>
              <div className="theme-material-card">
                <div className="card-icon">
                  <svg
                    width="24"
                    xmlns="http://www.w3.org/2000/svg"
                    height="24"
                    viewBox="0 0 24 24"
                  >
                    <g
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73zm1 .27V12"></path>
                      <path d="M3.29 7L12 12l8.71-5M7.5 4.27l9 5.15"></path>
                    </g>
                  </svg>
                </div>
                <div className="card-details">
                  <span className="card-name">照明機材</span>
                  <span className="card-category">照明</span>
                </div>
                <div className="card-stock">
                  <span className="stock-num">15</span>
                  <span className="stock-unit">台</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <div className="materials-container4">
        <div className="materials-container5">
          <Script
            html={`<style>
        @keyframes rotate-clock {0% {transform: rotate(0deg);}
100% {transform: rotate(360deg);}}@keyframes pulse-glow {0%,100% {opacity: 1;
box-shadow: 0 0 8px var(--ui-accent-glow);}
50% {opacity: 0.85;
box-shadow: 0 0 12px var(--ui-accent-glow);}}@keyframes pulse-indicator {0%,100% {transform: scale(1);
opacity: 1;}
50% {transform: scale(1.3);
opacity: 0.7;}}@keyframes pulse-status {0%,100% {opacity: 1;}
50% {opacity: 0.5;}}@keyframes pulse-alert {0%,100% {opacity: 1;
transform: scale(1);}
50% {opacity: 0.7;
transform: scale(1.1);}}@keyframes pulse-support {0%,100% {opacity: 1;
transform: scale(1);}
50% {opacity: 0.6;
transform: scale(1.1);}}@keyframes pulse-icon {0%,100% {opacity: 1;
transform: scale(1);}
50% {opacity: 0.7;
transform: scale(1.05);}}@keyframes pulse-alert-icon {0% {opacity: 1;}
100% {opacity: 0.6;}}@keyframes pulse-dot {0% {opacity: 1;
transform: scale(1);
box-shadow: 0 0 4px var(--ui-accent-glow);}
100% {opacity: 0.6;
transform: scale(1.2);
box-shadow: 0 0 8px var(--ui-accent-glow);}}
        </style> `}
          ></Script>
        </div>
      </div>
      <div className="materials-container6">
        <div className="materials-container7">
          <Script
            html={`<script defer data-name="materials-dashboard">
(function(){
  // Live clock update
  function updateLiveClock() {
    const timeElements = document.querySelectorAll("#live-time, .time-display")
    const now = new Date()
    const hours = String(now.getHours()).padStart(2, "0")
    const minutes = String(now.getMinutes()).padStart(2, "0")
    const seconds = String(now.getSeconds()).padStart(2, "0")
    const timeString = \`\${hours}:\${minutes}:\${seconds}\`

    timeElements.forEach((el) => {
      if (el) el.textContent = timeString
    })
  }

  // Update clock immediately and every second
  updateLiveClock()
  setInterval(updateLiveClock, 1000)

  // Filter functionality
  const filterButtons = document.querySelectorAll(".filter-btn")
  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const isActive = button.classList.contains("active")

      if (!isActive) {
        filterButtons.forEach((btn) => {
          btn.classList.remove("active")
          btn.setAttribute("aria-pressed", "false")
        })
        button.classList.add("active")
        button.setAttribute("aria-pressed", "true")
      }
    })
  })

  // Quick add form submission
  const quickAddForm = document.querySelector(".quick-add-form")
  if (quickAddForm) {
    quickAddForm.addEventListener("submit", (e) => {
      e.preventDefault()
      const formData = new FormData(quickAddForm)
      console.log("Adding material:", Object.fromEntries(formData))
      quickAddForm.reset()
    })
  }

  // Member row selection
  const memberRows = document.querySelectorAll(".member-row")
  memberRows.forEach((row) => {
    row.addEventListener("click", () => {
      memberRows.forEach((r) => {
        r.classList.remove("active")
        r.setAttribute("aria-pressed", "false")
      })
      row.classList.add("active")
      row.setAttribute("aria-pressed", "true")
    })
  })

  // Keyboard navigation for inventory items
  const inventoryItems = document.querySelectorAll(
    ".inventory-item, .material-item, .member-item"
  )
  inventoryItems.forEach((item, index) => {
    item.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault()
        item.click()
      }

      if (e.key === "ArrowDown" && inventoryItems[index + 1]) {
        e.preventDefault()
        inventoryItems[index + 1].focus()
      }

      if (e.key === "ArrowUp" && inventoryItems[index - 1]) {
        e.preventDefault()
        inventoryItems[index - 1].focus()
      }
    })
  })

  // Timeline auto-scroll animation
  const timelineScroll = document.querySelector(".timeline-scroll")
  if (timelineScroll) {
    const scrollToCenter = () => {
      const focusLine = timelineScroll.querySelector(".timeline-focus-line")
      if (focusLine) {
        const scrollLeft =
          (timelineScroll.scrollWidth - timelineScroll.clientWidth) * 0.4
        timelineScroll.scrollTo({
          left: scrollLeft,
          behavior: "smooth",
        })
      }
    }

    setTimeout(scrollToCenter, 500)
  }

  // Filter toggle functionality
  const filterToggles = document.querySelectorAll(
    '.filter-toggle input[type="checkbox"]'
  )
  filterToggles.forEach((toggle) => {
    toggle.addEventListener("change", () => {
      console.log(\`Filter \${toggle.id}: \${toggle.checked}\`)
    })
  })
})()
</script>`}
          ></Script>
        </div>
      </div>
      <Footer></Footer>
      <a href="https://play.teleporthq.io/signup">
        <div
          aria-label="Sign up to TeleportHQ"
          className="materials-container8"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 19 21"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="materials-icon294"
          >
            <path
              d="M9.1017 4.64355H2.17867C0.711684 4.64355 -0.477539 5.79975 -0.477539 7.22599V13.9567C-0.477539 15.3829 0.711684 16.5391 2.17867 16.5391H9.1017C10.5687 16.5391 11.7579 15.3829 11.7579 13.9567V7.22599C11.7579 5.79975 10.5687 4.64355 9.1017 4.64355Z"
              fill="#B23ADE"
            ></path>
            <path
              d="M10.9733 12.7878C14.4208 12.7878 17.2156 10.0706 17.2156 6.71886C17.2156 3.3671 14.4208 0.649963 10.9733 0.649963C7.52573 0.649963 4.73096 3.3671 4.73096 6.71886C4.73096 10.0706 7.52573 12.7878 10.9733 12.7878Z"
              fill="#FF5C5C"
            ></path>
            <path
              d="M17.7373 13.3654C19.1497 14.1588 19.1497 15.4634 17.7373 16.2493L10.0865 20.5387C8.67402 21.332 7.51855 20.6836 7.51855 19.0968V10.5141C7.51855 8.92916 8.67402 8.2807 10.0865 9.07221L17.7373 13.3654Z"
              fill="#2874DE"
            ></path>
          </svg>
          <span className="materials-text52">Built in TeleportHQ</span>
        </div>
      </a>
    </div>
  )
}

export default Materials

export function DeliveryTruck() {
  return (
    <div className="delivery-lane" aria-hidden="true">
      <div className="truck-journey">
        <svg
          viewBox="0 0 128 63"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <g className="truck-body">
            <path fill="#e6d7c3" d="m10 12 67-1 1 31-69 1z" />
            <path d="m14 16 57-1m-57 5 42-1M13 36l58-.6M7 46l2-4 69-.7 1-25 21 1 12 16 5 3 2 10-8 1M37 48l53-1" />
            <path fill="#f6efdf" d="m84 20 13 1 9 12-22-1z" />
            <path d="m83 35 1 7m8-6h4m17 1h3M6 45l1 4h9m-1-6q9-10 20 1m54-1q9-11 20 0" />
            <path opacity=".45" d="m16 30 7-7m-2 8 9-9m-1 8 6-6m24 14h10" />
          </g>
          {[26, 99].map((x) => (
            <g key={x} transform={`translate(${x} 48)`}>
              <circle r="8" fill="#f4ede2" />
              <circle r="4.3" />
              <path className="wheel-spoke" d="m-3 0 6 0m-3-3v6" />
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}

export function DeliveryMap() {
  return (
    <figure className="delivery-map">
      <svg
        viewBox="0 0 470 265"
        role="img"
        aria-label="Схема поставок из Подольска в Москву и область"
      >
        <defs>
          <radialGradient id="map-paper">
            <stop stopColor="#e8dcc8" />
            <stop offset="1" stopColor="#f8f5ef" stopOpacity="0" />
          </radialGradient>
        </defs>
        <ellipse cx="232" cy="132" rx="223" ry="132" fill="url(#map-paper)" />
        <g
          fill="none"
          stroke="#c6bbae"
          strokeWidth="1.15"
          strokeLinecap="round"
        >
          <path d="M112 90q15-50 83-62c42-6 104 8 127 35s17 66-15 82c-50 24-126 17-159-4s-48-26-36-51Z" />
          <path d="M147 93c18-34 78-48 115-36s53 38 22 58-97 23-123 1-15-16-14-23Z" />
          <path d="M70 48l100 36 63 12 104 51 64 9M201 13l13 50 16 30 65 5 87-31M95 165l62-43 74-28 48-65M352 209l-24-28-64-54-36-34" />
          <path
            stroke="#b5c7c4"
            strokeWidth="4"
            d="M79 84c37-6 44 35 68 18s33-25 44-10 13 26 35 15 33-15 46-1 38 9 47 25 42 19 63 13"
          />
        </g>
        <path
          d="M204 219c-3-21 18-36 12-60s9-43 12-67"
          fill="none"
          stroke="#885637"
          strokeWidth="2.6"
          strokeDasharray="3 5"
          strokeLinecap="round"
        />
        <g fill="#69462f" stroke="#f8f5ef" strokeWidth="3">
          <circle cx="228" cy="92" r="6" />
          <circle cx="204" cy="219" r="6" />
        </g>
        <g
          fill="#342c24"
          fontFamily="onest,sans-serif"
          fontWeight="550"
          paintOrder="stroke"
          stroke="#f4ede1"
          strokeWidth="4"
          strokeLinejoin="round"
        >
          <text x="241" y="87" fontSize="23">
            Москва
          </text>
          <text x="218" y="225" fontSize="20">
            Подольск
          </text>
        </g>
      </svg>
      <a
        href="https://yandex.ru/maps/?text=Подольск%2C%20Московская%20область"
        target="_blank"
        rel="noreferrer"
      >
        Открыть в Яндекс Картах
      </a>
    </figure>
  );
}

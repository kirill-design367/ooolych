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
        viewBox="0 0 448 144"
        role="img"
        aria-label="Схема направления Подольск — Москва"
      >
        <path
          d="M85 98h88c34 0 44-51 78-51h78"
          fill="none"
          stroke="#987558"
          strokeWidth="1.5"
        />
        <circle cx="85" cy="98" r="4.5" fill="#302921" />
        <circle
          cx="329"
          cy="47"
          r="5"
          fill="var(--paper)"
          stroke="#302921"
          strokeWidth="2"
        />
        <g
          fill="#352d26"
          fontFamily="onest,sans-serif"
          fontSize="19"
          fontWeight="500"
        >
          <text x="85" y="81" textAnchor="middle">
            Подольск
          </text>
          <text x="329" y="30" textAnchor="middle">
            Москва
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

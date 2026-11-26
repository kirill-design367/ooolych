import Link from "next/link";
export const metadata = { title: "Три пары шрифтов" };
const pairs = [
  [
    "Анбаундед + Онест",
    "unbounded",
    "onest",
    "Основная пара витрины. Широкие геометрические заголовки соседствуют с компактными строками заказа.",
  ],
  [
    "Голос + Онест",
    "golos-text",
    "onest",
    "Более спокойный вариант для плотных спецификаций. Простые формы сохраняют ясность длинных названий.",
  ],
  [
    "Литерата + Манроп",
    "literata",
    "manrope",
    "Редакционная пара. Засечки смягчают крупный заголовок, а геометрический гротеск удерживает ритм таблиц.",
  ],
];
export default function Fonts() {
  return (
    <section className="shell section fonts-page">
      <Link className="textlink" href="/">
        На главную
      </Link>
      <h1>
        Типографика<span>.</span>
      </h1>
      {pairs.map(([name, display, body, reason]) => (
        <article key={name} style={{ fontFamily: body }}>
          <small>{name}</small>
          <h2 style={{ fontFamily: display }}>Материалы на объект</h2>
          <p>{reason}</p>
          <div className="type-card">
            <small>Листовые материалы</small>
            <h3 style={{ fontFamily: display }}>Фанера берёзовая</h3>
            <strong>1 450 ₽ / лист</strong>
          </div>
          <table>
            <caption>Расчёт поставки</caption>
            <thead>
              <tr>
                <th>Материал</th>
                <th>Объём</th>
                <th>Стоимость</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Фанера</td>
                <td>10 листов</td>
                <td>14 500 ₽</td>
              </tr>
            </tbody>
          </table>
        </article>
      ))}
    </section>
  );
}

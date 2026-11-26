import Link from "next/link";
import { HoverWord } from "../../components/HoverWord";
export const metadata = { title: "Варианты логотипа" };
const marks = [
  ["01-prosvet", "Просвет", "Медный клин внутри буквы «Л»."],
  ["02-sechenie", "Сечение", "Параллельные штрихи повторяют слои фанеры."],
  ["03-prizma", "Призма", "Отдельный знак из двух граней и широкая надпись."],
  ["04-ottisk", "Оттиск", "Мягкие засечки и строчные буквы."],
  ["05-katushka", "Катушка", "Четыре витка кабеля складываются в знак."],
  ["06-marshrut", "Маршрут", "Открытые линии и медная точка назначения."],
  ["07-kontrast", "Контраст", "Срезанный угол и плотный набор букв."],
];
export default function LogoPage() {
  const root = (process.env.NEXT_PUBLIC_BASE_PATH || "") + "/materials/logos/";
  return (
    <section className="shell logo-gallery">
      <Link className="textlink" href="/">
        <HoverWord>На главную</HoverWord>
      </Link>
      <h1>Варианты логотипа</h1>
      <div className="mark-grid">
        {marks.map(([slug, name, description], i) => (
          <article className="mark-card" key={slug}>
            <div className="mark-stage">
              <img
                src={root + slug + ".svg"}
                alt={"Луч — " + name}
                width="336"
                height="126"
              />
            </div>
            <div className="mark-caption">
              <div>
                <h2>
                  <small>{String(i + 1).padStart(2, "0")}</small>
                  {name}
                </h2>
                <p>{description}</p>
              </div>
              <a
                href={root + slug + ".svg"}
                download={"Луч-" + name + ".svg"}
                aria-label={"Скачать SVG «" + name + "»"}
              >
                <HoverWord>Скачать SVG</HoverWord>
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

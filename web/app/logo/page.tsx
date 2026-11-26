import Link from "next/link";
import { HoverWord } from "../../components/HoverWord";
export const metadata = { title: "Варианты логотипа" };
const marks = [
  ["07-otkos", "Откос", "Медная плоскость на левой стойке «Л» задаёт угол всему слову."],
  ["otkos-falts", "Сгиб", "Два сгиба металлической полосы образуют «Л». Освещённая грань развёрнута к зрителю."],
  ["otkos-pilon", "Пилон", "Узкие буквы стоят как три опоры. Свет проходит вдоль наружного ребра первой."],
  ["otkos-stvor", "Створ", "В квадратном проёме вырезана «Л». Знак можно использовать отдельно от надписи."],
  ["otkos-naklon", "Уклон", "Три буквы наклонены по одной оси, как параллельные лучи на чертеже."],
  ["otkos-vyemka", "Выемка", "Первая буква вырезана в сплошной плите. Её силуэт образует просвет."],
  ["otkos-kromka", "Кромка", "Строчная надпись с мягким загибом «у» и плоскими торцами, как у гнутого профиля."],
  ["otkos-raskroy", "Раскрой", "Три сквозных разреза делят надпись на детали, которые можно вырезать из листа."],
  ["otkos-svetovod", "Световой шов", "Между двумя тёмными плоскостями оставлена одна полоса света."],
  ["otkos-prolet", "Пролёт", "Широкие буквы соединяют дальние опоры, как балка большого пролёта."],
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

import Image, { type StaticImageData } from "next/image";

type LinkItem = {
  readonly label: string;
  readonly href: string;
};

type MediaLink = LinkItem & {
  readonly image: string | StaticImageData;
  readonly alt: string;
  readonly className: string;
};

const upbringing = [
  "5 yo: ukraine's bronze chess champion. blindfold chess child prodigy (sans voir).",
  "6 yo – onwards: multiple olympiads winner: math, humanities {later: coding, economics}.",
  "9 yo: best kid actor award.",
  "11 yo: first song. poetry contest winner.",
  "14 yo: toured neighboring countries as band leader.",
  "19 yo: founded student theatre {director, screenwriter}. 50+ members. 700+ audience for the premiere.",
  "to this day: designing fashion items. writing. doing film photography.",
] as const;

const vlogLinks = [
  { label: "youtube channel (main)", href: "https://youtube.com/@dmytroklochko" },
  { label: "vlog with giorgio", href: "https://www.instagram.com/p/DYm87SroZHJ/" },
  { label: "in paris", href: "https://www.instagram.com/p/DYheZtSNZxM/" },
  { label: "kbs interview (korea)", href: "https://www.instagram.com/p/DYhL6c9Ti8M/" },
  { label: "vienna", href: "https://www.instagram.com/p/DYXLh6rI2JI/" },
  { label: "short reel", href: "https://www.instagram.com/p/DYj9W6yITif/" },
] as const satisfies readonly LinkItem[];

const featuredVlogs = [
  {
    label: "kbs interview (korea)",
    href: "https://www.instagram.com/p/DYhL6c9Ti8M/",
    image: "/images/vlog-kbs.png",
    alt: "Dmytro speaking to camera in a green cap and glasses",
    className: "media-card media-card--portrait",
  },
  {
    label: "vienna",
    href: "https://www.instagram.com/p/DYXLh6rI2JI/",
    image: "/images/vlog-vienna.jpg",
    alt: "Vienna's Votivkirche under a cloudy sky",
    className: "media-card media-card--landscape",
  },
  {
    label: "in paris",
    href: "https://www.instagram.com/p/DYheZtSNZxM/",
    image: "/images/vlog-paris.png",
    alt: "Dmytro filming a vlog by the Eiffel Tower",
    className: "media-card media-card--tall",
  },
] as const satisfies readonly MediaLink[];

const socialLinks = [
  { label: "manifesto", href: "https://replika.com/manifesto" },
  { label: "x (twitter)", href: "https://x.com/dkreplika" },
  { label: "instagram", href: "https://instagram.com/dmytrotoday" },
  { label: "youtube", href: "https://youtube.com/@dmytroklochko" },
  { label: "linkedin", href: "https://www.linkedin.com/in/heydmytro/" },
] as const satisfies readonly LinkItem[];

const books = [
  "the lord of the rings — j.r.r. tolkien",
  "upstream — mary oliver",
  "gaspard de la nuit — aloysius bertrand (also the ravel suite)",
  "man's search for meaning — viktor frankl",
] as const;

const records = ["rumours — fleetwood mac", "gaspard de la nuit — ravel"] as const;

function ExternalLink({ item, className }: { readonly item: LinkItem; readonly className?: string }) {
  return (
    <a className={className} href={item.href} target="_blank" rel="noreferrer">
      <span>{item.label}</span>
      <span aria-hidden="true" className="arrow">
        ↗
      </span>
    </a>
  );
}

function SectionTag({ children }: { readonly children: React.ReactNode }) {
  return (
    <p className="section-tag">
      <span aria-hidden="true" />
      {children}
    </p>
  );
}

export default function Home() {
  return (
    <>
      <a className="skip-link" href="#main-content">
        skip to content
      </a>

      <header className="site-header" aria-label="primary navigation">
        <a
          className="say-hi"
          href="https://instagram.com/dmytrotoday"
          target="_blank"
          rel="noreferrer"
        >
          say hi ↗
        </a>

        <a className="masthead" href="#top" aria-label="dmytro klochko, home">
          <span>dmytro</span> <em>klochko</em>
        </a>

        <details className="menu">
          <summary>menu</summary>
          <nav aria-label="main menu">
            <a href="#bio">bio</a>
            <a href="#career">career</a>
            <a href="#watch">vlog</a>
            <a href="#perso">perso ref</a>
            <a href="#press">press + socials</a>
          </nav>
        </details>
      </header>

      <main id="main-content">
        <section className="hero" id="top" aria-labelledby="hero-title">
          <div className="hero-collage" aria-hidden="true">
            <div className="hero-photo hero-photo--left">
              <Image
                src="/images/dmytro-lawn.png"
                alt=""
                fill
                priority
                sizes="(max-width: 700px) 48vw, 31vw"
              />
            </div>
            <div className="hero-photo hero-photo--center">
              <Image
                src="/images/dmytro-city.png"
                alt=""
                fill
                priority
                sizes="(max-width: 700px) 62vw, 40vw"
              />
            </div>
            <div className="hero-photo hero-photo--right">
              <Image
                src="/images/dmytro-detail.jpg"
                alt=""
                fill
                sizes="(max-width: 700px) 42vw, 25vw"
              />
            </div>
          </div>

          <div className="hero-copy">
            <SectionTag>intro</SectionTag>
            <h1 id="hero-title">
              jaywalker at the intersection of <em>art and technology.</em>
            </h1>
            <div className="hero-notes">
              <p>relentless pursuer. beholder of cathedrals all around. tech entrepreneur &amp; tinkerer.</p>
              <p>based between nyc, paris &amp; sf.</p>
            </div>
          </div>

          <span className="scribble scribble--hero" aria-hidden="true" />
        </section>

        <section className="about" id="bio" aria-labelledby="bio-title">
          <div className="about-inner">
            <SectionTag>about me</SectionTag>
            <div className="about-title">
              <h2 id="bio-title">about <em>me</em></h2>
              <p>born &amp; raised in donetsk, eastern ukraine.</p>
            </div>
            <div className="about-photo">
              <Image
                src="/images/dmytro-speaking.jpg"
                alt="Dmytro speaking during a presentation"
                fill
                sizes="(max-width: 760px) 80vw, 30vw"
              />
            </div>
            <p className="about-story">
              very poor household. fled war as a teenager. slept on the streets for weeks.
            </p>
            <p className="about-note">still curious. still moving. still making.</p>
          </div>
        </section>

        <section className="upbringing page-shell" aria-labelledby="upbringing-title">
          <SectionTag>bio</SectionTag>
          <div className="upbringing-heading">
            <h2 id="upbringing-title">upbringing</h2>
            <p>a life shaped by making things early — and often.</p>
          </div>

          <ol className="timeline">
            {upbringing.map((item, index) => (
              <li key={item}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <p>{item}</p>
              </li>
            ))}
          </ol>

          <div className="childhood-collage">
            <figure className="childhood-photo childhood-photo--chess">
              <Image
                src="/images/childhood-chess.jpg"
                alt="A childhood photograph beside a chess board"
                fill
                sizes="(max-width: 760px) 58vw, 24vw"
              />
              <figcaption>first obsession</figcaption>
            </figure>
            <figure className="childhood-photo childhood-photo--piano">
              <Image
                src="/images/childhood-piano.jpg"
                alt="A childhood photograph at the piano"
                fill
                sizes="(max-width: 760px) 56vw, 22vw"
              />
              <figcaption>practice / play</figcaption>
            </figure>
            <figure className="childhood-photo childhood-photo--now">
              <Image
                src="/images/dmytro-park.png"
                alt="Dmytro wearing a cap in a city park"
                fill
                sizes="(max-width: 760px) 52vw, 20vw"
              />
              <figcaption>ongoing →</figcaption>
            </figure>
            <span className="hand-arrow" aria-hidden="true">↗</span>
          </div>
        </section>

        <section className="career page-shell" id="career" aria-labelledby="career-title">
          <SectionTag>career</SectionTag>
          <div className="career-copy">
            <h2 id="career-title">career</h2>
            <p>
              first job at 6 yo {"{busking, improv}"}. first filmmaking gig at 13 yo. a hundred gigs and strange little jobs in between.
            </p>
            <p>
              10 years of product management. 6 years building ml-powered products {"{incl. 400m mau products}"}. 5 years hands-on gtm across global ai &amp; social products.
            </p>
            <p>former founder.</p>
            <p className="career-lede">
              now ceo at replika {"{42m+ users worldwide, #1 ai friend}"}. research with stanford, harvard, princeton.
            </p>
            <p>lecturer at the university of vienna.</p>
          </div>

          <figure className="career-art">
            <Image
              src="/images/art-abstract.jpg"
              alt="A colorful abstract painting"
              fill
              sizes="(max-width: 760px) 92vw, 52vw"
            />
            <figcaption>taste, action, magic</figcaption>
          </figure>

          <div className="career-marker" aria-hidden="true">
            <span>support your local</span>
            <strong>monkey business</strong>
            <span>🐒</span>
          </div>
        </section>

        <section className="ways" aria-labelledby="ways-title">
          <div className="page-shell ways-inner">
            <SectionTag>approach</SectionTag>
            <h2 id="ways-title">ways of <em>working</em></h2>
            <div className="ways-grid">
              <p>
                natural aptitude for taste, action bias, &amp; having too much fun shipping.<br />
                clairvoyance, aggressive optimism. following my nose.<br />
                very fucking clean and direct in my comms.
              </p>
              <p>
                culture in my teams is something i&apos;m incredibly proud of: violent intolerance for mediocre work. anime-level fellowship &amp; camaraderie. fearlessness. relentless pursuit of the mission.
              </p>
              <p>
                unhealthy excitement about customers {"{i have 3x more users than team members in slack lol}"}. making my product feel like magic. extensive experience working with the world&apos;s best brand agencies.
              </p>
            </div>
          </div>
        </section>

        <section className="watch page-shell" id="watch" aria-labelledby="watch-title">
          <SectionTag>vlog</SectionTag>
          <div className="watch-heading">
            <h2 id="watch-title">watch &amp; <em>listen</em></h2>
            <p>field notes, interviews and conversations from everywhere.</p>
          </div>

          <div className="media-grid">
            {featuredVlogs.map((item) => (
              <a
                className={item.className}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                key={item.href}
              >
                <span className="media-image">
                  <Image src={item.image} alt={item.alt} fill sizes="(max-width: 760px) 84vw, 31vw" />
                </span>
                <span className="media-label">
                  {item.label} <span aria-hidden="true">↗</span>
                </span>
              </a>
            ))}
          </div>

          <div className="watch-links" aria-label="more video links">
            {vlogLinks.map((item, index) => (
              <ExternalLink
                className="text-link"
                item={{ ...item, label: `${String(index + 1).padStart(2, "0")} / ${item.label}` }}
                key={item.href}
              />
            ))}
          </div>
        </section>

        <section className="personal" id="perso" aria-labelledby="perso-title">
          <div className="page-shell personal-inner">
            <SectionTag>perso ref</SectionTag>
            <div className="personal-heading">
              <h2 id="perso-title">favorites /<br /><em>taste / shelf</em></h2>
              <div className="swatches" aria-label="favorite colors">
                <span style={{ background: "#a7cbe8" }} />
                <span style={{ background: "#717c4c" }} />
                <span style={{ background: "#d7a1bb" }} />
                <span style={{ background: "#cc9d5d" }} />
                <span style={{ background: "#202f62" }} />
              </div>
            </div>

            <div className="shelf-grid">
              <div className="shelf-list">
                <h3>books</h3>
                <ol>
                  {books.map((book) => <li key={book}>{book}</li>)}
                </ol>
              </div>
              <div className="shelf-list">
                <h3>records</h3>
                <ol>
                  {records.map((record) => <li key={record}>{record}</li>)}
                </ol>
              </div>
              <figure className="museum-photo">
                <Image
                  src="/images/dmytro-museum.jpg"
                  alt="Dmytro standing in a museum in front of a large painting"
                  fill
                  sizes="(max-width: 760px) 85vw, 34vw"
                />
              </figure>
              <figure className="water-lilies">
                <Image
                  src="/images/art-water-lilies.jpg"
                  alt="Detail of water lilies in deep blue"
                  fill
                  sizes="(max-width: 760px) 52vw, 18vw"
                />
              </figure>
            </div>

            <div className="poems" aria-labelledby="poems-title">
              <h3 id="poems-title">poems</h3>
              <blockquote className="poem poem--one">
                <p>
                  i am lost in sorrento<br />
                  for i am the taste of its lemons and its women&apos;s feet<br />
                  i&apos;m the salt of its breeze<br />
                  i&apos;m so glad i can&apos;t breathe<br />
                  i&apos;m so tall i am whole twelve feet
                </p>
              </blockquote>
              <blockquote className="poem poem--two">
                <p>
                  This girl is the warm sensation of young sun on my bare chest;<br /><br />
                  her chestnut irises, and the greens in them, glimmer with playful unrest.<br /><br />
                  When she whispers her spells, her tricks, and her promises,<br />I couldn&apos;t get any slumber.<br /><br />
                  For she carries inside her an eternal summer,<br />an eternal summer.
                </p>
              </blockquote>
            </div>
          </div>
        </section>

        <section className="press page-shell" id="press" aria-labelledby="press-title">
          <SectionTag>interview page</SectionTag>
          <div className="press-title-row">
            <h2 id="press-title">finding <em>connection.</em></h2>
            <p>cph:dox 2026 (documentary on shared drive)</p>
          </div>

          <div className="press-collage">
            <figure className="press-interview">
              <Image
                src="/images/interview-poetry.png"
                alt="Interview still of Dmytro speaking about poetry"
                fill
                sizes="(max-width: 760px) 88vw, 42vw"
              />
            </figure>
            <figure className="press-flower">
              <Image
                src="/images/art-sunflowers.jpg"
                alt="A painting of sunflowers"
                fill
                sizes="(max-width: 760px) 58vw, 27vw"
              />
            </figure>
            <figure className="press-lecture">
              <Image
                src="/images/dmytro-lecture.png"
                alt="Dmytro lecturing at a university"
                fill
                sizes="(max-width: 760px) 60vw, 27vw"
              />
            </figure>
            <p className="press-caption">poetry, the human condition, and making technology feel a little more alive.</p>
          </div>

          <ExternalLink
            className="press-link"
            item={{
              label: "bloomberg — ‘going viral: replika, the ai companion app’",
              href: "https://www.bloomberg.com/news/videos/2023-01-14/going-viral-replika-the-ai-companion-app-video",
            }}
          />
        </section>

        <section className="social" aria-labelledby="social-title">
          <div className="page-shell social-inner">
            <SectionTag>social media</SectionTag>
            <h2 id="social-title">come say <em>hi.</em></h2>

            <div className="social-cutout" aria-hidden="true">
              <Image
                src="/images/dmytro-cutout.png"
                alt=""
                fill
                sizes="(max-width: 760px) 72vw, 37vw"
              />
            </div>
            <div className="social-reading" aria-hidden="true">
              <Image
                src="/images/dmytro-reading-cutout.png"
                alt=""
                fill
                sizes="(max-width: 760px) 42vw, 24vw"
              />
            </div>

            <div className="social-links">
              {socialLinks.map((item) => <ExternalLink className="text-link" item={item} key={item.href} />)}
            </div>
            <span className="scribble scribble--social" aria-hidden="true" />
          </div>

          <footer className="page-shell footer">
            <p>© 2026 dmytro klochko</p>
            <p>art × technology × monkey business</p>
            <a href="#top">back to top ↑</a>
          </footer>
        </section>
      </main>
    </>
  );
}

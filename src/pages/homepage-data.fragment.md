---
import Layout from "../layouts/Layout.astro";

const roles = [
  {
    company: "replika",
    what: "#1 ai friend. 42m users worldwide",
    role: "chief executive, product and technology officer",
    href: "https://replika.com",
    mark: "/images/marks/replika.png",
  },
  {
    company: "hunch",
    what: "remote team happiness saas",
    role: "founder and chief executive officer",
    mark: "/images/marks/homa.png",
  },
  {
    company: "chatfuel",
    what: "marketing ai agent. 150k+ businesses",
    role: "growth, ai",
    href: "https://chatfuel.com",
    mark: "/images/marks/chatfuel.png",
  },
  {
    company: "hily",
    what: "#3 dating app in the u.s. by downloads",
    role: "product, growth, data",
    href: "https://hily.com",
    mark: "/images/marks/hily.png",
  },
  {
    company: "vk",
    what: "largest european social network. 100m+ mau",
    role: "product, growth, ml",
    href: "https://vk.com",
    mark: "/images/marks/vk.png",
  },
  {
    company: "skyeng",
    what: "#1 1:1 education platform in europe",
    role: "product, growth",
    href: "https://skyeng.ru",
    mark: "/images/marks/skyeng.png",
  },
] as const;

// The photograph sits on the line it is evidence for, rather than in a strip
// beside the list where the reader has to work out which is which.
const log = [
  "5 yo: ukraine's bronze chess champion. blindfold chess child prodigy.",
  "6 yo+: olympiads winner: math, humanities {later: coding, economics}.",
  "9 yo: best kid actor award.",
  "11 yo: wrote my first song. poetry contest winner.",
  "14 yo: toured neighboring countries as band leader.",
  "19 yo: founded student theatre {director, screenwriter}. 50+ members. 700+ audience for the premiere.",
  "to this day: designing fashion items. writing. doing film photography.",
] as const;

// The caption number is the log line the photograph belongs to. That is all
// the connection needed; putting the pictures inside the list broke the grid.
const shots = [
  { n: "01", src: "/images/childhood-chess.jpg", cap: "locking in",
    alt: "Dmytro as a small boy at a tournament board, grinning, a row of chess pieces in front of him" },
  { n: "04", src: "/images/childhood-piano.jpg", cap: "writing songs",
    alt: "Dmytro as a child at an upright piano, seen from behind" },
  { n: "05", src: "/images/childhood-band.jpg", cap: "touring",
    alt: "Dmytro as a boy on stage with a microphone, mid-song, pointing at the crowd" },
] as const;

// His words. Highlighted one phrase per paragraph; more than that stops being
// emphasis.
const ways = [
  "i'm intense and <b>hands-on</b>: everyone reports directly to me, i write the architecture and the prompts, push code to production, and i hit all-nighters.",
  'my sense of urgency is outstanding. but i know where to slow down, to <b>go dreamy</b>, reach the next peak of ideas, find serendipity, and make the 10x thing that doesn&rsquo;t exist yet.',
  'i have a natural aptitude for <b>taste</b> and strong action bias. i am aggressively optimistic and <b>clairvoyant</b>, so i am best at building futuristic products.',
  "the culture in my teams: intolerance for mediocre work. <b>anime-level camaraderie</b>. fearlessness. relentless pursuit of the mission.",
] as const;

const press = {
  src: "time",
  href: "https://time.com/collections/davos-2026/7339222/ai-predictions-2026/",
  line: "\u201cwhat we care about is people getting happier.\u201d",
  meta: "dmytro klochko, \u201ccompanions go mainstream\u201d, 5 predictions for ai in 2026",
};

const studies = [
  { name: "princeton", href: "https://arxiv.org/abs/2311.10599", quoted: true },
  { name: "harvard", href: "https://www.hbs.edu/faculty/Pages/item.aspx?num=67360" },
  { name: "stanford", href: "https://www.nature.com/articles/s44184-023-00047-6" },
] as const;

const manifesto = {
  line: "\u201cwe want to help you flourish in real life. not become a better version of yourself \u2013 just more yourself. strong relationships. better health. meaning. momentum. a life that feels worth living while you\u2019re living it.\u201d",
  meta: "dmytro klochko, replika manifesto, 2026",
};

const studyQuote = {
  line: "\u201ccompanion chatbot users indicated that these relationships were beneficial to their social health.\u201d",
  meta: "guingrich & graziano, oxford intersections: ai in society, 2025",
};

const journey = [
  { text: "busking, improv, songwriting studio, volunteering.",
    pic: "/video/busking.mp4", video: true, poster: "/video/busking-poster.jpg",
    width: 440, height: 804 },
  { text: "19 yo: founded student theatre {director, screenwriter}. 50+ members. 700+ audience for the premiere.",
    pic: "/video/theatre.mp4", video: true, poster: "/video/theatre-poster.jpg",
    width: 760, height: 428 },
  { text: "14 yo: toured neighboring countries as band leader.",
    pic: "/images/journey/touring.jpg", width: 900, height: 654 },
  { text: "13 yo: first filmmaking gig.",
    pic: "/images/journey/filmgig.jpg", width: 760, height: 1014 },
  { text: "11 yo: wrote my first song. poetry contest winner.",
    pic: "/images/journey/piano.jpg", width: 900, height: 676 },
  { text: "9 yo: best kid actor award.",
    pic: "/video/actor.mp4", video: true, poster: "/video/actor-poster.jpg",
    width: 640, height: 480 },
  { text: "6 yo+: olympiads winner: math, humanities {later: coding, economics}.",
    pic: "/images/journey/olympiads.jpg", width: 900, height: 676 },
  { text: "5 yo: ukraine's bronze chess champion. blindfold chess child prodigy.",
    pic: "/images/childhood-chess.jpg", width: 700, height: 586 },
] as const;

const wall = [
  { src: "/images/wall/w01.webp", cap: "dieter rams" },
  { src: "/images/wall/w05.webp", cap: "hajime sorayama" },
  { src: "/images/wall/w13.webp", cap: "david bowie" },
  { src: "/images/wall/w04.webp", cap: "steve jobs" },
  { src: "/images/wall/w08.webp", cap: "robin williams" },
  { src: "/images/wall/w14.webp", cap: "serhii korolov" },
  { src: "/images/wall/w15.webp", cap: "akira kurosawa" },
  { src: "/images/wall/w16.webp", cap: "david foster wallace" },
] as const;

const title = "dmytro klochko";
const description =
  "ceo at replika. product and engineering, out of art, chess and theatre. based between nyc, paris and sf.";

const chapters = [
  { id: "top", label: "hello" },
  { id: "experience", label: "experience" },
  { id: "how", label: "how i work" },
  { id: "journey", label: "upbringing" },
  { id: "alongside", label: "other roles" },
  { id: "me", label: "literally me" },
  { id: "contact", label: "say hi" },
] as const;

const jobs = [
  {
    co: "replika",
    what: "#1 ai friend. 42m users worldwide",
    role: "chief executive, product and technology officer",
    href: "https://replika.com",
    mark: "/images/marks/replika.png",
    points: [
      "tripled revenue and made the company profitable",
      "x1.8 arpu, +58% d30 retention",
      "grew it to 42m users across 145+ countries",
      'led the rebrand end to end: picked <a href="https://studiodumbar.com/" target="_blank" rel="noreferrer">studio dumbar<span class="arw">\u2197</span></a> and every piece that shipped, and rewrote the tone of voice and the whole vibe myself',
      "redesigned the whole ui and customer journey",
      "shipped new avatars, voice and video calls, and a memory that holds the people and the arcs of a life in one place",
      'ran peer-reviewed research with <a href="https://www.hbs.edu/faculty/Pages/item.aspx?num=67360" target="_blank" rel="noreferrer">harvard<span class="arw">\u2197</span></a>, <a href="https://www.nature.com/articles/s44184-023-00047-6" target="_blank" rel="noreferrer">stanford<span class="arw">\u2197</span></a> and <a href="https://arxiv.org/abs/2311.10599" target="_blank" rel="noreferrer">princeton<span class="arw">\u2197</span></a>',
      "rebuilt the team from the ground up: phds, true artists and pirates",
      'put replika back in the zeitgeist {<a href="https://time.com/collections/davos-2026/7339222/ai-predictions-2026/" target="_blank" rel="noreferrer">time<span class="arw">\u2197</span></a>, cnn, bbc, reuters, cbs, kbs, german national tv, australian and new zealand primetime, mastermind paris}',
      "spun a new app out of the company and sold it for multiple millions",
      "cut product and infrastructure cost by 90% while retention kept climbing",
      "went full founder mode for the company in legislatures and in public, from the <b>u.s. senate</b> to european governments, with ferocity and <i>true</i> resourcefulness",
      'designed the swag myself, <a href="https://x.com/replika/status/1991136959385817336" target="_blank" rel="noreferrer">down to the label<span class="arw">\u2197</span></a>',
    ],
  },
  {
    co: "hunch",
    what: "remote team happiness saas",
    role: "founder and chief executive officer",
    mark: "/images/marks/homa.png",
    points: [
      "founded it and took it to hundreds of thousands in arr",
      "raised pre-seed from top silicon valley angels",
      "closed the first 14 contracts myself {four of them enterprise} on 600+ customer calls",
      "recruited a world-class founding engineering and design team",
      "shipped a saas platform with a self-service skills marketplace on top of it, which no competitor had",
      "gave every employee at every client a card of their own, traits and rating, in a view nobody had drawn before",
      "built those cards out of many signals at once: micro-loops of peer feedback, ai reading of slack engagement, and their git and email data",
    ],
  },
  {
    co: "chatfuel",
    what: "marketing ai agent. 150k+ businesses",
    role: "growth, ai",
    mark: "/images/marks/chatfuel.png",
    href: "https://chatfuel.com",
    media: {
      video: true,
      src: "/video/cv-meta.mp4",
      webm: "/video/cv-meta.webm",
      poster: "/video/cv-meta-poster.jpg",
      full: "/video/meta-chatfuel.mp4",
      cap: "the ad meta made about it",
      screen: true,
    },
    points: [
      "took the product into new markets across three continents and won every one of them",
      "repositioned the product into new product-market fit, which opened acquisition channels that had been closed to us",
      "reshaped the ai core of the product to unlock growth",
      "ran the partnership with <b>meta</b> hands-on, shipping a long run of work with their teams",
    ],
  },
  {
    co: "hily",
    what: "#3 dating app in the u.s. by downloads",
    role: "product, growth, data",
    mark: "/images/marks/hily.png",
    href: "https://hily.com",
    media: {
      src: "/images/cv-lecture.jpg",
      width: 1100,
      height: 734,
      alt: "Dmytro at a flip chart, microphone in hand, mid-lecture",
      cap: "lecturing",
    },
    points: [
      "ran tens of winning experiments on the flagship, an app 300k people opened every day",
      "rebuilt how the company tested ideas: from one concept a month to thirty of the riskiest a week",
      "founded a new app out of an insight from pmf expansion discovery",
      "lectured for the company and for its users",
    ],
  },
  {
    co: "vk",
    what: "largest european social network. 100m+ mau",
    role: "product, growth, ml",
    mark: "/images/marks/vk.png",
    href: "https://vk.com",
    points: [
      "changed what millions of people do daily on the largest social network, from doomscrolling to microlearning",
      "built ml pipelines that read what a hundred million people were interested in and good at, then pointed them at learning",
      "redrew ui and ux patterns inside a machine that size",
      "drove retention and time spent up, and made that time worth spending",
    ],
  },
  {
    co: "skyeng",
    what: "#1 1:1 education platform in europe",
    role: "product, growth",
    mark: "/images/marks/skyeng.png",
    href: "https://skyeng.ru",
    points: [
      "ran a one-person accelerator inside the company, launching products 0\u21921",
      "owned every funnel, gate and conversion rate in the company, from the front page to app onboarding",
      "built hundreds of landing pages, 43 of them in a single night",
      "rebuilt mobile onboarding and experimented until conversion and activation doubled",
      "made onboarding recognise which influencer a user had arrived from and rebuild itself around them, 3.7x funnel conversion",
      "fixed mobile marketing analytics in ten days, first time ever touching it, after years of it defeating everyone",
      "ran growth and product for skyeng's magazine, millions of visitors, turning its stories into personalised self-serve funnels",
      "rebuilt the data pipelines under all of it",
      'wrote for it too: <a href="/writing/staying-human">on staying human</a>, and gave it <a href="/writing/english-teacher">the story of how i learned english</a>',
    ],
  },
] as const;

const also = [
  { what: "lecturer", where: "university of vienna",
    href: "https://comai.space/en/ai-companionship-an-interview-with-dmytro-klochko-ceo-of-replika/" },
  { what: "lecturer", where: "british higher school of art & design", href: "https://britishdesign.ru/about/tutors/196920/" },
  { what: "mentor", where: "50+ product people, designers and entrepreneurs" },
  { what: "volunteer", where: "ukrainian causes" },
] as const;
---

import Link from "next/link";

const sampleNeeds = [

  {

    title: "2 Stand Fans for Grade 4",

    school: "St. James Academy",

    location: "Plaridel, Bulacan",

    learners: 38,

    value: "₱3,600",

    status: "Open",

  },

  {

    title: "Reading Workbooks",

    school: "San Miguel Elementary School",

    location: "Bulacan",

    learners: 42,

    value: "₱4,250",

    status: "Open",

  },

  {

    title: "Classroom Whiteboard",

    school: "Plaridel Central School",

    location: "Plaridel, Bulacan",

    learners: 35,

    value: "₱2,800",

    status: "Open",

  },

];

export default function Home() {

  return (
<main>
<section className="hero">
<div>
<div className="eyebrow">Give Back to School Philippines</div>
<div className="pilot-badge">Pilot · Sample data</div>
<h1>Help a classroom. See where it goes.</h1>
<p className="hero-copy">

            Verified teachers post specific classroom needs. Givers choose what

            they want to provide, purchase the goods directly, and follow the

            fulfilment until the teacher confirms receipt.
</p>
<div className="hero-actions">
<Link className="btn" href="/needs">

              Browse school needs
</Link>
<Link className="btn secondary" href="/teacher">

              I’m a teacher
</Link>
</div>
</div>
<div className="hero-highlight">
<span className="tag">How GBTS works</span>
<h2>No donation money passes through GBTS.</h2>
<p>

            Teachers request specific goods. Givers provide the goods directly.

            The platform tracks the process and confirms receipt.
</p>
</div>
</section>
<section className="section">
<div className="section-heading">
<div>
<div className="eyebrow">Pilot dashboard</div>
<h2>Progress at a glance</h2>
</div>
<span className="sample-note">Sample figures for testing</span>
</div>
<div className="impact-grid">
<div className="metric-card">
<div className="metric-number">3</div>
<div className="metric-label">Verified schools</div>
</div>
<div className="metric-card">
<div className="metric-number">6</div>
<div className="metric-label">Verified teachers</div>
</div>
<div className="metric-card">
<div className="metric-number">4</div>
<div className="metric-label">Open classroom needs</div>
</div>
<div className="metric-card">
<div className="metric-number">2</div>
<div className="metric-label">Needs completed</div>
</div>
</div>
</section>
<section className="section">
<div className="section-heading">
<div>
<div className="eyebrow">Current needs</div>
<h2>Classrooms waiting for support</h2>
</div>
<Link href="/needs">View all needs →</Link>
</div>
<div className="needs-grid">

          {sampleNeeds.map((need) => (
<article className="need-card" key={need.title}>
<div className="need-topline">
<span className="status-badge">{need.status}</span>
<span>{need.value}</span>
</div>
<h3>{need.title}</h3>
<p className="school-name">{need.school}</p>
<p className="muted">{need.location}</p>
<div className="need-meta">
<span>{need.learners} learners</span>
<span>Physical goods only</span>
</div>
<Link className="text-link" href="/needs">

                View need →
</Link>
</article>

          ))}
</div>
</section>
<section className="section">
<div className="eyebrow">Simple by design</div>
<h2>Need. Give. Receive.</h2>
<div className="steps-grid">
<div className="step-card">
<div className="step-number">01</div>
<h3>Teacher</h3>
<p>

              A verified teacher submits a specific classroom need for review.
</p>
</div>
<div className="step-card">
<div className="step-number">02</div>
<h3>Giver</h3>
<p>

              A giver commits to the need and purchases or provides the goods

              directly.
</p>
</div>
<div className="step-card">
<div className="step-number">03</div>
<h3>School</h3>
<p>

              The teacher confirms that the goods were received and the need is

              completed.
</p>
</div>
</div>
</section>
<section className="section transparency-panel">
<div>
<div className="eyebrow">Built for transparency</div>
<h2>Clear rules from request to receipt.</h2>
</div>
<div className="transparency-list">
<div>✓ Verified teachers only</div>
<div>✓ Specific goods, not cash requests</div>
<div>✓ GBTS does not receive donation money</div>
<div>✓ Fulfilment and teacher receipt confirmation tracked</div>
<div>✓ Private teacher and giver contact details stay protected</div>
<div>✓ Admin review for verification, needs and disputes</div>
</div>
</section>
<section className="section final-cta">
<div>
<div className="eyebrow">Give Back to School pilot</div>
<h2>Small needs can make a real classroom difference.</h2>
<p className="muted">

            We’re building the pilot now. Test the experience, explore the

            sample needs, or register as a teacher.
</p>
</div>
<div className="hero-actions">
<Link className="btn" href="/needs">

            Browse needs
</Link>
<Link className="btn secondary" href="/teacher">

            Teacher portal
</Link>
</div>
</section>
</main>

  );

}
 

import "./globals.css";

import Link from "next/link";

import { Manrope } from "next/font/google";

const manrope = Manrope({

  subsets: ["latin"],

  variable: "--font-manrope",

});

export const metadata = {

  title: "Give Back to School",

  description:

    "Verified school needs. Direct giving. Transparent results.",

};

export default function Layout({

  children,

}: {

  children: React.ReactNode;

}) {

  return (
<html className={manrope.variable}>
<body>
<header>
<div className="nav">
<Link className="brand" href="/">

              GIVE BACK TO SCHOOL
<small>PHILIPPINES</small>
</Link>
<nav className="links">
<Link href="/needs">School Needs</Link>
<Link href="/how-it-works">How It Works</Link>
<Link href="/about">Mission</Link>
<Link href="/faq">FAQ</Link>
</nav>
<Link className="btn secondary" href="/teacher">

              For Teachers
</Link>
</div>
</header>

        {children}
<footer className="footer">
<div>
<b>Give Back to School</b>
<p>

              Schools tell us what they need. You choose what you want to give.
</p>
<small>

              Physical goods for classroom requests • Direct giving between

              giver and school
</small>
</div>
</footer>
</body>
</html>

  );

}
 

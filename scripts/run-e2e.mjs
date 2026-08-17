import http from "node:http";

const WEB_URL = process.env.WEB_URL || "http://localhost:3000";
const API_URL = process.env.API_URL || "http://localhost:5000/api";

const testResults = [];

function recordTest(id, name, status, details = "", latency = 0) {
  testResults.push({ id, name, status, details, latency });
  const icon = status ? "✓ PASS" : "✗ FAIL";
  console.log(`[${icon}] Flow ${id.toString().padStart(2, '0')}: ${name} (${latency}ms) - ${details}`);
}

async function fetchWithTiming(url, options = {}) {
  const start = performance.now();
  const res = await fetch(url, options);
  const latencyMs = Math.round(performance.now() - start);
  return { res, latencyMs };
}

async function runE2ESuite() {
  console.log("\n========================================================");
  console.log("  STARTING ALL 9 E2E TESTS ON ENGINOW MAIN WEB & API   ");
  console.log("========================================================\n");

  // ------------------------------------------------------------------------
  // FLOW 1: Home & Landing Page Navigation Flow
  // ------------------------------------------------------------------------
  try {
    const { res, latencyMs } = await fetchWithTiming(`${WEB_URL}/`);
    const html = await res.text();
    const hasNav = html.includes("Courses") && html.includes("Training") && html.includes("Internships");
    const hasHero = html.includes("Enginow") || html.includes("Learn engineering");
    const hasFooter = html.includes("Enginow") && html.includes("All rights reserved");
    const pass = res.status === 200 && hasNav && hasHero && hasFooter;
    recordTest(1, "Landing Page & Navigation Flow", pass, `Status: ${res.status}, Nav: ${hasNav}, Hero: ${hasHero}, Footer: ${hasFooter}`, latencyMs);
  } catch (err) {
    recordTest(1, "Landing Page & Navigation Flow", false, `Error: ${err.message}`, 0);
  }

  // ------------------------------------------------------------------------
  // FLOW 2: Courses Catalog & Course Detail Flow
  // ------------------------------------------------------------------------
  try {
    const { res: catRes, latencyMs: catLat } = await fetchWithTiming(`${WEB_URL}/courses`);
    const apiRes = await fetch(`${API_URL}/courses/published`);
    const courses = await apiRes.json();
    let detailPass = true;
    if (Array.isArray(courses) && courses.length > 0 && courses[0].slug) {
      const { res: dRes } = await fetchWithTiming(`${WEB_URL}/courses/${courses[0].slug}`);
      detailPass = dRes.status === 200;
    }
    const pass = catRes.status === 200 && Array.isArray(courses) && detailPass;
    recordTest(2, "Courses Catalog & Detail Page Flow", pass, `Courses Count: ${courses.length || 0}, Catalog Status: ${catRes.status}, Detail OK: ${detailPass}`, catLat);
  } catch (err) {
    recordTest(2, "Courses Catalog & Detail Page Flow", false, `Error: ${err.message}`, 0);
  }

  // ------------------------------------------------------------------------
  // FLOW 3: Cohort Training & Syllabus Flow
  // ------------------------------------------------------------------------
  try {
    const { res: trRes, latencyMs: trLat } = await fetchWithTiming(`${WEB_URL}/trainings`);
    const apiRes = await fetch(`${API_URL}/trainings`);
    const trainings = await apiRes.json();
    let detailPass = true;
    if (Array.isArray(trainings) && trainings.length > 0 && trainings[0].slug) {
      const { res: dRes } = await fetchWithTiming(`${WEB_URL}/trainings/${trainings[0].slug}`);
      detailPass = dRes.status === 200;
    }
    const pass = trRes.status === 200 && Array.isArray(trainings) && detailPass;
    recordTest(3, "Cohort Training & Syllabus Flow", pass, `Trainings Status: ${trRes.status}, Published: ${Array.isArray(trainings) ? trainings.length : 0}, Detail OK: ${detailPass}`, trLat);
  } catch (err) {
    recordTest(3, "Cohort Training & Syllabus Flow", false, `Error: ${err.message}`, 0);
  }

  // ------------------------------------------------------------------------
  // FLOW 4: Internships & Seasonal Intake Cohorts
  // ------------------------------------------------------------------------
  try {
    const { res: intRes, latencyMs: intLat } = await fetchWithTiming(`${WEB_URL}/internship`);
    const { res: monRes } = await fetchWithTiming(`${WEB_URL}/monsoon-internship`, { redirect: "manual" });
    const apiRes = await fetch(`${API_URL}/internships`);
    const internships = await apiRes.json();
    const pass = intRes.status === 200 && (monRes.status === 200 || monRes.status === 307 || monRes.status === 308) && Array.isArray(internships);
    recordTest(4, "Internships & Seasonal Cohort Flow", pass, `Internship Page: ${intRes.status}, Seasons Redirect: ${monRes.status}, Count: ${Array.isArray(internships) ? internships.length : 0}`, intLat);
  } catch (err) {
    recordTest(4, "Internships & Seasonal Cohort Flow", false, `Error: ${err.message}`, 0);
  }

  // ------------------------------------------------------------------------
  // FLOW 5: Careers & Job Listings Application Flow
  // ------------------------------------------------------------------------
  try {
    const { res: carRes, latencyMs: carLat } = await fetchWithTiming(`${WEB_URL}/careers`);
    const apiRes = await fetch(`${API_URL}/careers`);
    const careers = await apiRes.json();
    const pass = carRes.status === 200 && Array.isArray(careers);
    recordTest(5, "Careers & Job Application Flow", pass, `Careers Page: ${carRes.status}, Active Openings: ${Array.isArray(careers) ? careers.length : 0}`, carLat);
  } catch (err) {
    recordTest(5, "Careers & Job Application Flow", false, `Error: ${err.message}`, 0);
  }

  // ------------------------------------------------------------------------
  // FLOW 6: Shop Merchandise & Checkout Flow
  // ------------------------------------------------------------------------
  try {
    const { res: listRes, latencyMs: listLat } = await fetchWithTiming(`${WEB_URL}/shop`);
    const listHtml = await listRes.text();
    const hasShopTitle = listHtml.includes("Our Collection") || listHtml.includes("ENGINOW SHOP");
    const apiRes = await fetch(`${API_URL}/shop`);
    const products = await apiRes.json();
    let detailPass = true;
    if (Array.isArray(products) && products.length > 0 && products[0].slug) {
      const { res: dRes } = await fetchWithTiming(`${WEB_URL}/shop/${products[0].slug}`);
      detailPass = dRes.status === 200;
    }
    const pass = listRes.status === 200 && hasShopTitle && Array.isArray(products) && detailPass;
    recordTest(6, "Shop Merchandise & Checkout Flow", pass, `Shop Status: ${listRes.status}, Products: ${Array.isArray(products) ? products.length : 0}, Detail OK: ${detailPass}`, listLat);
  } catch (err) {
    recordTest(6, "Shop Merchandise & Checkout Flow", false, `Error: ${err.message}`, 0);
  }

  // ------------------------------------------------------------------------
  // FLOW 7: Practice Center & Assessment Platform
  // ------------------------------------------------------------------------
  try {
    const { res: pracRes, latencyMs: pracLat } = await fetchWithTiming(`${WEB_URL}/practice`);
    const pracHtml = await pracRes.text();
    const hasPracticeHeader = pracHtml.includes("Practice") && pracHtml.includes("Center");
    const apiRes = await fetch(`${API_URL}/practice`);
    const tests = await apiRes.json();
    const pass = pracRes.status === 200 && hasPracticeHeader && Array.isArray(tests);
    recordTest(7, "Practice Center & Assessment Flow", pass, `Practice Page: ${pracRes.status}, Practice Tests: ${Array.isArray(tests) ? tests.length : 0}`, pracLat);
  } catch (err) {
    recordTest(7, "Practice Center & Assessment Flow", false, `Error: ${err.message}`, 0);
  }

  // ------------------------------------------------------------------------
  // FLOW 8: Resources & Blog Reader Platform
  // ------------------------------------------------------------------------
  try {
    const { res: resRes, latencyMs: resLat } = await fetchWithTiming(`${WEB_URL}/resources`);
    const { res: blogRes } = await fetchWithTiming(`${WEB_URL}/blogs`);
    const apiRes = await fetch(`${API_URL}/blogs`);
    const blogs = await apiRes.json();
    const pass = resRes.status === 200 && blogRes.status === 200 && Array.isArray(blogs);
    recordTest(8, "Resources & Blog Reader Flow", pass, `Resources Page: ${resRes.status}, Blogs Page: ${blogRes.status}, Blogs: ${Array.isArray(blogs) ? blogs.length : 0}`, resLat);
  } catch (err) {
    recordTest(8, "Resources & Blog Reader Flow", false, `Error: ${err.message}`, 0);
  }

  // ------------------------------------------------------------------------
  // FLOW 9: Auth, Learner Dashboard, Verification & Institutional Pages
  // ------------------------------------------------------------------------
  try {
    const pages = ["/auth", "/learner-dashboard", "/verify", "/brand-guidelines", "/about", "/services"];
    const results = await Promise.all(pages.map(p => fetchWithTiming(`${WEB_URL}${p}`)));
    const all200 = results.every(r => r.res.status === 200);
    const avgLat = Math.round(results.reduce((acc, r) => acc + r.latencyMs, 0) / results.length);
    recordTest(9, "Auth, Dashboard, Verification & Info Flow", all200, `Auth: ${results[0].res.status}, Dashboard: ${results[1].res.status}, Verify: ${results[2].res.status}, Brand: ${results[3].res.status}, About: ${results[4].res.status}, Services: ${results[5].res.status}`, avgLat);
  } catch (err) {
    recordTest(9, "Auth, Dashboard, Verification & Info Flow", false, `Error: ${err.message}`, 0);
  }

  const passedCount = testResults.filter(t => t.status).length;
  console.log("\n========================================================");
  console.log(`  E2E TEST SUMMARY: ${passedCount} / ${testResults.length} PASSED`);
  console.log("========================================================\n");

  if (passedCount < testResults.length) {
    process.exit(1);
  }
}

runE2ESuite();

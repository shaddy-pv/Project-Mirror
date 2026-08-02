import fetch from "node-fetch";

const API_URL = "http://localhost:5000/api";

async function testEndpoints() {
  console.log("Testing backend endpoints...");
  
  try {
    // 1. Test Courses Public Route
    console.log("-> GET /courses/published");
    const resCourses = await fetch(`${API_URL}/courses/published`);
    const courses = await resCourses.json();
    console.log("   Status:", resCourses.status, "Courses count:", courses.length);

    // 2. Test Careers Public Route
    console.log("-> GET /careers");
    const resCareers = await fetch(`${API_URL}/careers`);
    const careers = await resCareers.json();
    console.log("   Status:", resCareers.status, "Careers count:", careers.length);

    // 3. Test Internships Public Route
    console.log("-> GET /internships");
    const resInternships = await fetch(`${API_URL}/internships`);
    const internships = await resInternships.json();
    console.log("   Status:", resInternships.status, "Internships count:", internships.length);

    // 4. Test Blogs Public Route
    console.log("-> GET /blogs");
    const resBlogs = await fetch(`${API_URL}/blogs`);
    const blogs = await resBlogs.json();
    console.log("   Status:", resBlogs.status, "Blogs count:", blogs.length);

    console.log("All public reads successful!");
  } catch (err) {
    console.error("Test failed:", err);
  }
}

testEndpoints();

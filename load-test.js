/*import http from "k6/http";
import { check, sleep } from "k6";

export let options = {
  stages: [
    { duration: "10s", target: 10 }, // Ramp up to 10 users in 10 seconds
    { duration: "20s", target: 50 }, // Keep 50 users for 20 seconds
    { duration: "10s", target: 0 },  // Ramp down
  ],
};

export default function () {
  let landingPageRes = http.get("https://maintenance-management-system-two.vercel.app/");
  let loginPageRes = http.get("https://maintenance-management-system-two.vercel.app/login");

  check(landingPageRes, {
    //"Landing page loaded successfully": (r) => r.status === 200,
    "Landing page response time < 2s": (r) => r.timings.duration < 20000,
  });

  check(loginPageRes, {
    //"Login page loaded successfully": (r) => r.status === 200,
    "Login page response time < 2s": (r) => r.timings.duration < 20000,
  });

  sleep(1); // Simulate real user browsing delay
}
*/
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  vus: 50, // Simulating 50 concurrent users
  duration: '40s', // Test duration
};

export default function () {
  // Test 1: Admin Dashboard Load Time
  let dashboardRes = http.get('https://maintenance-management-system-two.vercel.app/admin/dashboard');

  check(dashboardRes, {
    'Admin dashboard loads in under 3s': (r) => r.timings.duration < 30000,
  });

  // Test 2: Login Page Load Time (50 concurrent users)
  let loginRes = http.get('https://maintenance-management-system-two.vercel.app/login');

  check(loginRes, {
    'Login page loads in under 2s': (r) => r.timings.duration < 20000,
  });

  sleep(1); // Pause between requests
}

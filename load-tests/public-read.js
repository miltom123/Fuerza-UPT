import http from "k6/http";
import { check, sleep } from "k6";

const baseUrl = __ENV.BASE_URL || "http://localhost:3000";
const smoke = __ENV.SMOKE === "true";

export const options = smoke
  ? { vus: 2, duration: "10s", thresholds: thresholds() }
  : {
      scenarios: {
        home: scenario(500, "/"),
        events: scenario(500, "/eventos", "20s"),
        opportunities: scenario(300, "/becas", "40s"),
        representation: scenario(500, "/representacion-estudiantil", "60s"),
        polls: scenario(200, "/encuestas", "80s"),
      },
      thresholds: thresholds(),
    };

function scenario(target, path, startTime = "0s") {
  return {
    executor: "ramping-vus",
    startTime,
    startVUs: 0,
    stages: [
      { duration: "30s", target },
      { duration: "60s", target },
      { duration: "20s", target: 0 },
    ],
    exec: "publicPage",
    env: { PATH_UNDER_TEST: path },
  };
}

function thresholds() {
  return {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<300", "p(99)<800"],
  };
}

export function publicPage() {
  const response = http.get(`${baseUrl}${__ENV.PATH_UNDER_TEST || "/"}`);
  check(response, { "status is 200": (result) => result.status === 200 });
  sleep(1);
}

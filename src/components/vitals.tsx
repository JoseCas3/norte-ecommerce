"use client";
import { useReportWebVitals } from "next/web-vitals";
export function Vitals() {
  useReportWebVitals((metric) => {
    if (process.env.NODE_ENV !== "production")
      console.info("[Web Vitals]", metric.name, metric.value, metric.rating);
  });
  return null;
}

"use client"; // Required for Next.js App Router

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import "./SuccessPage.css"; // Import CSS

export default function SuccessPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [countdown, setCountdown] = useState(10);

    // Get form type and reference ID from query params
    const formType = searchParams.get("form") || "Application";
    const id = searchParams.get("id") || Math.floor(Math.random() * 10000);

    useEffect(() => {
        document.title = `${formType} Submitted Successfully`;

        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    router.push("/dashboard");
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [router]);

    return (
        <div className="success-page-container">
            <div className="success-card">
                <div className="icon-container">
                    <div className="icon-circle">
                        <svg className="check-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                </div>

                <h1 className="success-title">Thank You!</h1>

                <p className="success-message">
                    Your <strong>{formType}</strong> has been successfully submitted. We will review your application and get back to you shortly.
                </p>

                <p className="reference-number">
                    Application Reference: <span className="reference-id">{id}</span>
                </p>

                <div className="button-container">
                    <button onClick={() => router.push("/dashboard")} className="home-button">
                        Back to Home
                    </button>
                </div>

                <p className="countdown-text">
                    Redirecting to home in {countdown} seconds...
                </p>
            </div>
        </div>
    );
}

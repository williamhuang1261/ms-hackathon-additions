"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import StickyHeader from "@/components/LandingPage/StickyHeader";
import ThankYouHeader from "@/components/ThankYouPage/ThankYouHeader";
import AiThankYouMessage from "@/components/ThankYouPage/AiThankYouMessage";
import Certificate from "@/components/Certificate";
import { CERTIFICATE_TIERS, getCertificateTier } from "@/lib/donation-utils";

type DonationSummary = {
  donorName: string;
  amount: number;
  impact: string;
  timestamp?: number;
};

const FALLBACK_DONATION: DonationSummary = {
  donorName: "Friend of Athena",
  amount: 150,
  impact:
    "emergency shelter nights, trauma-informed counseling, and legal advocacy for survivors.",
};

const ThankYouPage = () => {
  const t = useTranslations("thank");
  const searchParams = useSearchParams();
  const paramsKey = useMemo(
    () => searchParams?.toString() ?? "",
    [searchParams]
  );

  const donationData = useMemo<DonationSummary | null>(() => {
    if (typeof window !== "undefined") {
      const storedDonation = window.sessionStorage.getItem("latestDonation");
      if (storedDonation) {
        try {
          const parsed = JSON.parse(storedDonation) as DonationSummary;
          if (parsed?.amount && parsed?.impact) {
            return parsed;
          }
        } catch (error) {
          console.error("Failed to parse stored donation", error);
        }
      }
    }

    if (!paramsKey) {
      return null;
    }

    const fallbackParams = new URLSearchParams(paramsKey);
    const amountParam = Number(fallbackParams.get("amount"));
    const impactParam = fallbackParams.get("impact");

    if (!Number.isFinite(amountParam) || !impactParam) {
      return null;
    }

    const donorParam = fallbackParams.get("donor");

    return {
      donorName: donorParam?.trim() ? donorParam.trim() : "Friend of Athena",
      amount: amountParam,
      impact: impactParam,
    };
  }, [paramsKey]);

  const donorName = donationData?.donorName ?? "Friend of Athena";
  const donationImpact = donationData?.impact ?? FALLBACK_DONATION.impact;
  const donationAmount = donationData?.amount ?? FALLBACK_DONATION.amount;
  const certificateTier = getCertificateTier(Math.max(donationAmount, 10));
  const certificateTheme = CERTIFICATE_TIERS[certificateTier];

  return (
    <div className="flex min-h-screen flex-col bg-light-background">
      <div className="fixed left-0 right-0 top-0 z-50 w-full px-6 pt-6 sm:px-16">
        <StickyHeader />
      </div>
      <main className="flex w-full flex-1 justify-center px-4 pb-24 pt-36 sm:px-8 lg:px-12 xl:px-16">
        <section className="flex w-full max-w-[1500px] flex-col gap-12">
          <header className="text-center mt-8">
            <h1 className="text-4xl font-semibold text-primary sm:text-5xl">
              {t("title")}
            </h1>
            <p className="mt-4 text-lg text-accent">{t("subtitle")}</p>
          </header>

          <div className="flex flex-col gap-8 items-center">
            <div className="flex h-full flex-col items-center gap-6 text-center w-full lg:items-start lg:text-left p-8">
              <ThankYouHeader
                primaryColor={certificateTheme.color}
                accentColor={certificateTheme.badgeAccent}
                softBackgroundColor={certificateTheme.bgColor}
                gradientBackground={certificateTheme.badgeGradient}
              />
              <AiThankYouMessage
                donorName={donorName}
                amount={donationAmount}
                impactDescription={donationImpact}
                textColor={certificateTheme.color}
              />
            </div>
            <div className="flex h-full w-full items-stretch justify-center lg:justify-end">
              <Certificate
                variant="inline"
                donorName={donorName}
                amount={Math.round(donationAmount)}
                impactDescription={donationImpact}
                tier={certificateTier}
              />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default ThankYouPage;

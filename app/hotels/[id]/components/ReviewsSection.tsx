"use client";

import { useState, useEffect, useMemo } from "react";
import { StarIcon } from "@/components/icons";
import type { ReviewWithAuthor } from "@/lib/types";
import { Section } from "./SectionWrapper";
import { createClient } from "@/lib/supabase/client";
import ReviewForm from "@/components/ReviewForm";
import type { User } from "@supabase/supabase-js";
import { X, Search, CheckCircle2, MessageSquare, ShieldCheck } from "lucide-react";

interface ReviewsSectionProps {
  hotelId: string;
  reviews: ReviewWithAuthor[];
  avgRating: number | null;
  reviewCount: number;
  ratingHistogram: Record<number, number>;
}

export function ReviewsSection({
  hotelId,
  reviews,
  avgRating,
  reviewCount,
  ratingHistogram,
}: ReviewsSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRating, setSelectedRating] = useState<number | null>(null);

  // Gating state
  const [user, setUser] = useState<User | null>(null);
  const [completedBookingsCount, setCompletedBookingsCount] = useState<number>(0);
  const [userReviewsCount, setUserReviewsCount] = useState<number>(0);
  const [loadingEligibility, setLoadingEligibility] = useState<boolean>(true);

  useEffect(() => {
    const supabase = createClient();
    
    const checkEligibility = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);

      if (currentUser) {
        try {
          const [bookingsRes, reviewsRes] = await Promise.all([
            supabase
              .from("bookings")
              .select("*", { count: "exact", head: true })
              .eq("guest_id", currentUser.id)
              .eq("hotel_id", hotelId)
              .eq("status", "completed"),
            supabase
              .from("reviews")
              .select("*", { count: "exact", head: true })
              .eq("user_id", currentUser.id)
              .eq("hotel_id", hotelId)
          ]);

          setCompletedBookingsCount(bookingsRes.count || 0);
          setUserReviewsCount(reviewsRes.count || 0);
        } catch (err) {
          console.error("Error checking eligibility:", err);
        }
      }
      setLoadingEligibility(false);
    };

    checkEligibility();
  }, [hotelId]);

  // Main page preview shows a maximum of 4 reviews (2x2 grid)
  const previewReviews = useMemo(() => {
    return reviews.slice(0, 4);
  }, [reviews]);

  // Filtered reviews for the modal
  const filteredReviews = useMemo(() => {
    return reviews.filter((review) => {
      const matchesRating = selectedRating === null || review.rating === selectedRating;
      const matchesSearch =
        searchTerm.trim() === "" ||
        (review.comment &&
          review.comment.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (review.reviewer_name &&
          review.reviewer_name.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesRating && matchesSearch;
    });
  }, [reviews, selectedRating, searchTerm]);

  // Helper to render stars
  const renderStars = (rating: number, sizeClass = "h-3.5 w-3.5") => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarIcon
            key={star}
            className={`${sizeClass} ${
              star <= rating ? "text-gold-500" : "text-slate-200"
            }`}
            filled={star <= rating}
          />
        ))}
      </div>
    );
  };

  // Helper to highlight search term in text
  const highlightText = (text: string, search: string) => {
    if (!search.trim()) return text;
    const regex = new RegExp(`(${escapeRegExp(search)})`, "gi");
    const parts = text.split(regex);
    return (
      <>
        {parts.map((part, i) =>
          regex.test(part) ? (
            <mark key={i} className="bg-yellow-100 text-yellow-800 rounded px-0.5 font-semibold">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    );
  };

  // Helper to escape regex special characters
  function escapeRegExp(string: string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  // Format date helper
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      month: "long",
      year: "numeric",
    });
  };

  // Format stay details text
  const formatStayDetails = (review: ReviewWithAuthor) => {
    if (!review.stay_details) return null;
    const { nights, room_name, check_out } = review.stay_details;
    const stayNights = nights ? `${nights} night${nights > 1 ? "s" : ""}` : "stay";
    const date = new Date(check_out).toLocaleDateString("en-IN", {
      month: "short",
      year: "numeric",
    });
    return `Stayed ${stayNights} · ${room_name} · ${date}`;
  };

  return (
    <Section id="reviews" title="Guest Reviews">
      {/* 1. Header Aggregates */}
      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-8 mb-8">
        {/* Aggregates Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-center items-center text-center">
          <span className="text-5xl font-black text-slate-900 tracking-tight">
            {avgRating !== null ? avgRating.toFixed(1) : "0.0"}
          </span>
          <div className="mt-2">
            {renderStars(Math.round(avgRating ?? 0), "h-5 w-5")}
          </div>
          <span className="text-xs text-slate-500 font-bold mt-2 uppercase tracking-wider">
            {reviewCount} verified review{reviewCount === 1 ? "" : "s"}
          </span>
        </div>

        {/* Histogram */}
        <div className="flex flex-col justify-center space-y-2">
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = ratingHistogram[rating] ?? 0;
            const percentage = reviewCount > 0 ? (count / reviewCount) * 100 : 0;
            return (
              <div key={rating} className="flex items-center gap-3 text-xs font-semibold">
                <span className="w-3 text-slate-600 text-right">{rating}</span>
                <StarIcon className="h-3.5 w-3.5 text-gold-500" filled />
                <div className="h-2 flex-1 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-gold-400 to-gold-500 transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="w-8 text-slate-400 text-right">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Reviews Preview Grid (Main Page) */}
      {previewReviews.length > 0 ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {previewReviews.map((review) => {
              const initials = review.reviewer_name
                ? review.reviewer_name
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase()
                : "G";
              
              const stayText = formatStayDetails(review);

              return (
                <div
                  key={review.id}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition duration-300 flex flex-col justify-between"
                >
                  <div>
                    {/* Review Header */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        {/* Avatar */}
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700 font-bold text-sm border border-brand-100">
                          {initials}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 leading-tight">
                            {review.reviewer_name || "Verified Guest"}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="flex items-center gap-0.5 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700 border border-emerald-100/60 uppercase tracking-wide">
                              <CheckCircle2 className="h-2.5 w-2.5" /> Verified Stay
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        {renderStars(review.rating, "h-3.5 w-3.5")}
                        <p className="text-[10px] text-slate-400 mt-1 font-bold">
                          {formatDate(review.created_at)}
                        </p>
                      </div>
                    </div>

                    {/* Stay Context */}
                    {stayText && (
                      <p className="text-[10.5px] font-semibold text-slate-400 mb-2.5">
                        {stayText}
                      </p>
                    )}

                    {/* Comment */}
                    {review.comment && (
                      <p className="text-sm text-slate-600 leading-relaxed font-medium">
                        &ldquo;{review.comment}&rdquo;
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Show All Button */}
          {reviews.length > 4 && (
            <div className="flex justify-center pt-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="rounded-xl border border-slate-300 px-6 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-sm cursor-pointer"
              >
                Show all {reviews.length} reviews
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center bg-slate-50/50">
          <p className="text-sm text-slate-500 font-medium">
            No reviews yet. Be the first to share your experience after your stay!
          </p>
        </div>
      )}

      {/* 3. Gated Review Submission Section */}
      <div className="mt-8 border-t border-slate-100 pt-6">
        {user ? (
          loadingEligibility ? (
            <div className="flex items-center gap-2 justify-center py-4">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-brand-600" />
              <span className="text-xs text-slate-500 font-bold">Verifying eligibility...</span>
            </div>
          ) : completedBookingsCount > userReviewsCount ? (
            <ReviewForm hotelId={hotelId} />
          ) : completedBookingsCount > 0 ? (
            <div className="rounded-2xl bg-brand-50/50 border border-brand-100 p-5 flex items-start gap-3">
              <div className="shrink-0 text-brand-600 mt-0.5">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800">Thank you for your feedback!</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  You have already reviewed your stay at this hotel. To write another review, you must complete a new booking.
                </p>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-6 flex items-start gap-4 shadow-sm">
              <div className="shrink-0 text-slate-700 p-2 bg-white rounded-xl border border-slate-200 shadow-sm">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider">
                  Verified Reviews Only
                </h4>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed font-medium">
                  At BookNest, we ensure all reviews are written by actual guests. To leave a review, please use the **Checkout QR Code** provided by the front desk staff during checkout, or submit it directly from your **Booking Details** portal once your stay is marked as completed.
                </p>
              </div>
            </div>
          )
        ) : (
          <div className="rounded-2xl bg-slate-50 border border-slate-200 p-5 text-center">
            <p className="text-xs text-slate-500 font-bold">
              Please{" "}
              <a href={`/login?redirect=/hotels/${hotelId}`} className="text-brand-600 hover:underline">
                log in
              </a>{" "}
              to write a review. Gated to verified guests only.
            </p>
          </div>
        )}
      </div>

      {/* 4. Airbnb-style Review Explorer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 animate-fade-in">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          />

          {/* Modal Container */}
          <div className="relative w-full max-w-5xl h-[85vh] bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row z-10 animate-scale-up border border-slate-200">
            
            {/* Left Pane (Aggregates & Filters) */}
            <div className="w-full md:w-[320px] shrink-0 border-b md:border-b-0 md:border-r border-slate-100 bg-slate-50/50 p-6 flex flex-col justify-between">
              <div>
                {/* Modal Title & Close Button */}
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-black text-slate-800 uppercase tracking-wider">
                    Reviews Explorer
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="p-1.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition cursor-pointer"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Star Summary */}
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-5xl font-black text-slate-900">
                    {avgRating !== null ? avgRating.toFixed(1) : "0.0"}
                  </span>
                  <div>
                    {renderStars(Math.round(avgRating ?? 0), "h-4 w-4")}
                    <p className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-wide">
                      {reviewCount} reviews
                    </p>
                  </div>
                </div>

                {/* Search Input */}
                <div className="relative mb-6">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 pointer-events-none">
                    <Search className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search reviews..."
                    className="w-full pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-800 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 shadow-sm"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {/* Rating Filter List */}
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
                    Filter by Rating
                  </p>
                  {[5, 4, 3, 2, 1].map((rating) => {
                    const count = ratingHistogram[rating] ?? 0;
                    const isSelected = selectedRating === rating;
                    return (
                      <button
                        key={rating}
                        type="button"
                        onClick={() => setSelectedRating(isSelected ? null : rating)}
                        className={`w-full flex items-center justify-between p-2 rounded-xl text-xs font-bold transition border cursor-pointer ${
                          isSelected
                            ? "bg-brand-50 border-brand-200 text-brand-700 shadow-sm"
                            : "bg-white border-slate-200/60 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <span>{rating} Star{rating > 1 ? "s" : ""}</span>
                          <StarIcon className="h-3 w-3 text-gold-500" filled />
                        </div>
                        <span className="text-[10px] text-slate-400">{count}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Reset Filters button */}
              {(selectedRating !== null || searchTerm.trim() !== "") && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRating(null);
                    setSearchTerm("");
                  }}
                  className="w-full mt-4 rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition shadow cursor-pointer"
                >
                  Clear Filters
                </button>
              )}
            </div>

            {/* Right Pane (Scrollable Review List) */}
            <div className="flex-1 p-6 overflow-y-auto min-h-0 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-2">
                <span className="text-xs font-bold text-slate-500">
                  Showing {filteredReviews.length} of {reviews.length} reviews
                </span>
              </div>

              {filteredReviews.length > 0 ? (
                <div className="space-y-4">
                  {filteredReviews.map((review) => {
                    const initials = review.reviewer_name
                      ? review.reviewer_name
                          .split(" ")
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join("")
                          .toUpperCase()
                      : "G";
                    
                    const stayText = formatStayDetails(review);

                    return (
                      <div
                        key={review.id}
                        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-between hover:border-slate-300 transition"
                      >
                        <div>
                          {/* Review Header */}
                          <div className="flex items-start justify-between gap-3 mb-2.5">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700 font-bold text-xs border border-brand-100">
                                {initials}
                              </div>
                              <div>
                                <p className="font-bold text-slate-900 text-xs leading-tight">
                                  {review.reviewer_name
                                    ? highlightText(review.reviewer_name, searchTerm)
                                    : "Verified Guest"}
                                </p>
                                <div className="flex items-center gap-1 mt-0.5">
                                  <span className="flex items-center gap-0.5 rounded-full bg-emerald-50 px-1 py-0.5 text-[8px] font-bold text-emerald-700 border border-emerald-100/40 uppercase tracking-wide">
                                    <CheckCircle2 className="h-2 w-2" /> Verified Stay
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              {renderStars(review.rating, "h-3 w-3")}
                              <p className="text-[9px] text-slate-400 mt-1 font-bold">
                                {formatDate(review.created_at)}
                              </p>
                            </div>
                          </div>

                          {/* Stay Context */}
                          {stayText && (
                            <p className="text-[10px] font-semibold text-slate-400 mb-2">
                              {stayText}
                            </p>
                          )}

                          {/* Comment */}
                          {review.comment && (
                            <p className="text-xs text-slate-600 leading-relaxed font-medium">
                              &ldquo;{highlightText(review.comment, searchTerm)}&rdquo;
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 p-12 text-center bg-slate-50/50 flex flex-col items-center justify-center">
                  <MessageSquare className="h-8 w-8 text-slate-300 mb-2" />
                  <p className="text-xs text-slate-500 font-bold">No matching reviews found</p>
                  <p className="text-[10px] text-slate-400 mt-1">Try adjusting your search keywords or rating filters.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Section>
  );
}

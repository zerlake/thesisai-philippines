import { AdvancedLiteratureReviewMatrix } from "@/components/advanced-literature-review-matrix";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Literature Review Matrix",
    description: "Organize and synthesize your research sources.",
};

export default function LiteratureReviewMatrixPage() {
    return (
        <div className="container mx-auto py-10">
            <AdvancedLiteratureReviewMatrix />
        </div>
    );
}
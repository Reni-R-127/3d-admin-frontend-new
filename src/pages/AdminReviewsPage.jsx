import ResourceManagementPage from "../components/ResourceManagementPage.jsx";

const config = {
  title: "Reviews",
  endpoint: "/admin/reviews",
  singular: "review",
  description: "Moderate customer reviews published to the storefront.",
  fields: [
    {
      key: "customerName",
      label: "Customer name",
      type: "text",
      required: true,
    },
    {
      key: "rating",
      label: "Rating (1–5)",
      type: "number",
      min: 1,
      max: 5,
      step: 1,
      required: true,
    },
    {
      key: "body",
      label: "Review",
      type: "textarea",
      required: true,
    },
    {
      key: "status",
      label: "Status",
      type: "select",
      required: false,
      options: ["pending", "published", "approved", "rejected"],
    },
  ],
  statuses: ["pending", "published", "approved", "rejected"],
  columns: [
    { key: "customerName", label: "Name" },
    { key: "rating", label: "Rating" },
    { key: "status", label: "Status" },
    { key: "createdAt", label: "Created" },
    { key: "actions", label: "Actions" },
  ],
  emptyDescription:
    "No records are returned by the configured API. This screen does not use fabricated data.",
};

export default function AdminReviewsPage() {
  return <ResourceManagementPage config={config} />;
}

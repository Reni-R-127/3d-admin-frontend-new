import { useEffect, useMemo, useState } from "react";
import { Plus, RefreshCw, Search, Pencil, Trash2, Save, X } from "lucide-react";
import { api } from "../api.js";
import PageHeader from "./PageHeader.jsx";
import Button from "../shared/buttons/Button.jsx";
import FormField from "../shared/inputs/FormField.jsx";
import DataTable from "../shared/tables/DataTable.jsx";
import StatusBadge from "./StatusBadge.jsx";
import ConfirmDialog from "../shared/modals/ConfirmDialog.jsx";
import Toast from "../shared/feedback/Toast.jsx";
import useDebouncedValue from "../hooks/useDebouncedValue.js";
import { dateTime, titleCase } from "../utils/format.js";

export default function ResourceManagementPage({ config }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [editor, setEditor] = useState(null);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState(null);
  const [remove, setRemove] = useState(null);

  const debounced = useDebouncedValue(search);
  const endpoint = config.endpoint;

  async function load() {
    setLoading(true);
    setError("");

    try {
      const response = await api(
        `${endpoint}?limit=100${debounced ? `&search=${encodeURIComponent(debounced)}` : ""}${status ? `&status=${encodeURIComponent(status)}` : ""}`,
      );
      setRows(response.data ?? response.items ?? []);
    } catch (requestError) {
      setError(requestError.message || "Unable to load records.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // load is intentionally re-run when the endpoint or filters change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint, debounced, status]);

  const visible = useMemo(
    () =>
      rows.filter(
        (row) =>
          !debounced ||
          JSON.stringify(row).toLowerCase().includes(debounced.toLowerCase()),
      ),
    [rows, debounced],
  );

  function open(row = null) {
    const initial = {};

    config.fields.forEach((field) => {
      initial[field.key] =
        row?.[field.key] ?? (field.type === "checkbox" ? false : "");
    });

    setEditor(row ? { ...initial, _id: row._id } : initial);
  }

  async function save(event) {
    event.preventDefault();
    setBusy(true);
    setError("");

    try {
      const payload = { ...editor };
      delete payload._id;

      for (const field of config.fields) {
        if (
          field.type === "number" &&
          payload[field.key] !== "" &&
          payload[field.key] != null
        ) {
          payload[field.key] = Number(payload[field.key]);
        }

        if (field.type === "number" && payload[field.key] === "") {
          delete payload[field.key];
        }
      }

      await api(editor._id ? `${endpoint}/${editor._id}` : endpoint, {
        method: editor._id ? "PATCH" : "POST",
        body: JSON.stringify(payload),
      });

      setEditor(null);
      setToast({
        type: "success",
        message: `${config.singular} saved successfully.`,
      });
      await load();
    } catch (requestError) {
      setToast({
        type: "error",
        message: requestError.message || "Unable to save this record.",
      });
    } finally {
      setBusy(false);
    }
  }

  async function deleteRow() {
    if (!remove) return;

    setBusy(true);

    try {
      await api(`${endpoint}/${remove._id}`, { method: "DELETE" });
      setRemove(null);
      setToast({
        type: "success",
        message: `${config.singular} deleted.`,
      });
      await load();
    } catch (requestError) {
      setToast({
        type: "error",
        message: requestError.message || "Unable to delete this record.",
      });
    } finally {
      setBusy(false);
    }
  }

  function renderActions(row) {
    return (
      <div className="row-actions">
        <button
          type="button"
          className="icon-button"
          onClick={() => open(row)}
          aria-label={`Edit ${config.singular.toLowerCase()}`}
        >
          <Pencil size={15} />
        </button>
        <button
          type="button"
          className="icon-button danger-hover"
          onClick={() => setRemove(row)}
          aria-label={`Delete ${config.singular.toLowerCase()}`}
        >
          <Trash2 size={15} />
        </button>
      </div>
    );
  }

  const defaultColumns = [
    {
      key: "name",
      label: "Name",
      render: (row) => (
        <b>
          {row.name ||
            row.title ||
            row.question ||
            row.email ||
            row.orderNumber ||
            "—"}
        </b>
      ),
    },
    {
      key: "description",
      label: "Details",
      render: (row) =>
        row.description || row.subject || row.kind || row.sku || "—",
    },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <StatusBadge
          value={row.status || (row.published ? "published" : "draft")}
        />
      ),
    },
    {
      key: "createdAt",
      label: "Created",
      render: (row) => dateTime(row.createdAt),
    },
    {
      key: "actions",
      label: "Actions",
      render: renderActions,
    },
  ];

  // Resource pages can define their own visible columns without changing
  // the fields used by the Create/Edit modal.
  const requestedColumns = config.columns || config.tableColumns;
  const reviewAwareRenderers = {
    customerName: (row) => (
      <b>{row.customerName || row.customer || row.name || "—"}</b>
    ),
    rating: (row) => {
      const rating = Number(row.rating);
      return row.rating !== "" && row.rating != null && Number.isFinite(rating)
        ? (
            <span>
              <span style={{ color: "#f59e0b" }} aria-hidden="true">
                ★
              </span>{" "}
              {rating} / 5
            </span>
          )
        : "—";
    },
    status: (row) => (
      <StatusBadge
        value={row.status || (row.published ? "published" : "draft")}
      />
    ),
    createdAt: (row) => dateTime(row.createdAt),
    actions: renderActions,
  };

  const columns = Array.isArray(requestedColumns)
    ? requestedColumns.map((column) => ({
        ...column,
        render:
          column.render ||
          reviewAwareRenderers[column.key] ||
          ((row) => row[column.key] ?? "—"),
      }))
    : defaultColumns;

  return (
    <>
      <PageHeader
        eyebrow={config.eyebrow || "STUDIO MANAGEMENT"}
        title={config.title}
        description={config.description}
        actions={
          <>
            <Button variant="secondary" onClick={load} disabled={loading}>
              <RefreshCw size={15} /> Refresh
            </Button>
            {config.create !== false && (
              <Button onClick={() => open()}>
                <Plus size={16} /> Add {config.singular.toLowerCase()}
              </Button>
            )}
          </>
        }
      />

      {toast && <Toast type={toast.type}>{toast.message}</Toast>}

      <section className="surface-card management-card">
        <div className="management-toolbar">
          <label className="search-box">
            <Search size={16} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={`Search ${config.title.toLowerCase()}…`}
            />
          </label>

          <select
            className="plain-select"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            aria-label="Filter by status"
          >
            <option value="">All statuses</option>
            {(config.statuses || [
              "draft",
              "published",
              "active",
              "inactive",
              "pending",
              "in_progress",
              "completed",
              "cancelled",
            ]).map((itemStatus) => (
              <option key={itemStatus} value={itemStatus}>
                {titleCase(itemStatus)}
              </option>
            ))}
          </select>

          <span className="record-count">
            {loading
              ? "Loading…"
              : `${visible.length} record${visible.length === 1 ? "" : "s"}`}
          </span>
        </div>

        <DataTable
          columns={columns}
          rows={visible}
          loading={loading}
          error={error}
          emptyTitle={`No ${config.title.toLowerCase()} found`}
          emptyDescription={
            config.emptyDescription ||
            "Records appear here after they are created or received by the API."
          }
        />
      </section>

      {editor && (
        <div
          className="modal-backdrop"
          onMouseDown={(event) =>
            event.target === event.currentTarget &&
            !busy &&
            setEditor(null)
          }
        >
          <form className="edit-modal" onSubmit={save}>
            <div className="modal-heading">
              <div>
                <span className="eyebrow">
                  {editor._id ? "EDIT RECORD" : "NEW RECORD"}
                </span>
                <h2>
                  {editor._id
                    ? `Edit ${config.singular.toLowerCase()}`
                    : `Create ${config.singular.toLowerCase()}`}
                </h2>
              </div>

              <button
                type="button"
                className="icon-button"
                onClick={() => setEditor(null)}
                aria-label="Close"
                disabled={busy}
              >
                <X size={18} />
              </button>
            </div>

            <div className="editor-fields">
              {config.fields.map((field) =>
                field.type === "checkbox" ? (
                  <label className="check-field" key={field.key}>
                    <input
                      type="checkbox"
                      checked={Boolean(editor[field.key])}
                      onChange={(event) =>
                        setEditor({
                          ...editor,
                          [field.key]: event.target.checked,
                        })
                      }
                    />
                    {field.label}
                  </label>
                ) : (
                  <FormField
                    key={field.key}
                    label={field.label}
                    as={
                      field.type === "textarea"
                        ? "textarea"
                        : field.type === "select"
                          ? "select"
                          : "input"
                    }
                    type={
                      field.type === "number"
                        ? "number"
                        : field.type === "email"
                          ? "email"
                          : field.type === "url"
                            ? "url"
                            : undefined
                    }
                    min={field.min ?? (field.type === "number" ? 0 : undefined)}
                    max={field.max}
                    step={field.step}
                    required={field.required}
                    value={editor[field.key] ?? ""}
                    onChange={(event) =>
                      setEditor({
                        ...editor,
                        [field.key]: event.target.value,
                      })
                    }
                  >
                    {field.options?.map((option) => (
                      <option
                        key={option.value || option}
                        value={option.value || option}
                      >
                        {option.label || titleCase(option.value || option)}
                      </option>
                    ))}
                  </FormField>
                ),
              )}
            </div>

            <div className="dialog-actions">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setEditor(null)}
                disabled={busy}
              >
                Cancel
              </Button>
              <Button disabled={busy}>
                <Save size={16} />
                {busy ? "Saving…" : "Save changes"}
              </Button>
            </div>
          </form>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(remove)}
        title={`Delete ${config.singular.toLowerCase()}?`}
        message="This action cannot be undone."
        busy={busy}
        onClose={() => setRemove(null)}
        onConfirm={deleteRow}
      />
    </>
  );
}

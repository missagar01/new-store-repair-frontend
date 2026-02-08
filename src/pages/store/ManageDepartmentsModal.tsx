import { useState, useEffect, useRef } from "react";
import { X, Plus, Trash2, Edit, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { storeApi } from "../../services";

type Department = {
  id: number;
  department: string;
  hod: string;
  mobile_number: string;
};

interface ManageDepartmentsModalProps {
  onClose: () => void;
}

export function ManageDepartmentsModal({ onClose }: ManageDepartmentsModalProps) {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  // Form State
  const [editId, setEditId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    department: "",
    hod: "",
    mobile_number: "",
  });

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const deptInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const res: any = await storeApi.getDepartments();
      if (res?.success && res.data) {
        setDepartments(res.data);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load departments");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setEditId(null);
    setFormData({ department: "", hod: "", mobile_number: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.department.trim()) {
      toast.error("Department name is required");
      return;
    }

    setProcessing(true);
    try {
      if (editId) {
        const res: any = await storeApi.updateDepartment(editId, formData);
        if (res?.success) {
          toast.success("Department updated");
          fetchDepartments();
          handleReset();
        }
      } else {
        const res: any = await storeApi.createDepartment(formData);
        if (res?.success) {
          toast.success("Department created");
          fetchDepartments();
          handleReset();
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Operation failed");
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this department?")) return;

    try {
      const res: any = await storeApi.deleteDepartment(id);
      if (res?.success) {
        toast.success("Department deleted");
        fetchDepartments();
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete department");
    }
  };

  const handleEdit = (dept: Department) => {
    setEditId(dept.id);
    setFormData({
      department: dept.department,
      hod: dept.hod || "",
      mobile_number: dept.mobile_number || "",
    });

    // Scroll to top and focus
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
    setTimeout(() => {
      deptInputRef.current?.focus();
    }, 100);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center bg-slate-50">
          <h2 className="text-xl font-bold text-slate-800">Manage Departments</h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-full transition-colors">
            <X size={24} className="text-slate-500" />
          </button>
        </div>

        <div ref={scrollContainerRef} className="flex-1 overflow-auto p-4 space-y-6">
          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-4">
            <h3 className="font-semibold text-slate-700">{editId ? "Edit Department" : "Add New Department"}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-500 uppercase">Department Name</label>
                <Input
                  ref={deptInputRef}
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  placeholder="e.g. AUTOMATION"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-500 uppercase">HOD Name</label>
                <Input
                  value={formData.hod}
                  onChange={(e) => setFormData({ ...formData, hod: e.target.value })}
                  placeholder="e.g. John Doe"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-500 uppercase">Mobile (+91)</label>
                <Input
                  value={formData.mobile_number}
                  onChange={(e) => setFormData({ ...formData, mobile_number: e.target.value })}
                  placeholder="10 digit number"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              {editId && (
                <Button type="button" variant="outline" onClick={handleReset}>
                  Cancel
                </Button>
              )}
              <Button type="submit" disabled={processing} className="bg-blue-600 hover:bg-blue-700 text-white min-w-[100px]">
                {processing ? <Loader2 className="animate-spin w-4 h-4" /> : editId ? "Update" : "Create"}
              </Button>
            </div>
          </form>

          {/* List */}
          <div className="space-y-3">
            <h3 className="font-semibold text-slate-700 flex items-center gap-2">
              All Departments
              <span className="bg-slate-200 text-slate-600 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">
                {departments.length}
              </span>
            </h3>
            {loading ? (
              <div className="flex justify-center p-8 text-slate-400">
                <Loader2 className="animate-spin w-8 h-8" />
              </div>
            ) : departments.length === 0 ? (
              <div className="text-center p-8 border-2 border-dashed rounded-lg text-slate-400">
                No departments found. Add one above.
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
                <table className="w-full text-sm">
                  <thead className="bg-slate-100 border-b">
                    <tr>
                      <th className="px-4 py-2 text-left font-semibold text-slate-600">Department</th>
                      <th className="px-4 py-2 text-left font-semibold text-slate-600">HOD</th>
                      <th className="px-4 py-2 text-left font-semibold text-slate-600">Mobile</th>
                      <th className="px-4 py-2 text-right font-semibold text-slate-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {departments.map((dept) => (
                      <tr key={dept.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 font-medium text-slate-800">{dept.department}</td>
                        <td className="px-4 py-3 text-slate-600">{dept.hod || "—"}</td>
                        <td className="px-4 py-3 text-slate-600">{dept.mobile_number || "—"}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(dept)}
                              className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            >
                              <Edit size={16} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(dept.id)}
                              className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

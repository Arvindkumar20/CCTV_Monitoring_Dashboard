// components/guardian/StudentTable.jsx
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card } from "@/components/ui/card";
import {
  Edit,
  Trash2,
  Eye,
  MoreVertical,
  Calendar,
  BookOpen,
  Users,
  Phone,
  Mail,
  GraduationCap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const StudentTable = ({ students = [], onEdit, onDelete, guardianId }) => {
  const [deleteId, setDeleteId] = useState(null);
  const navigate = useNavigate();

  const getInitials = (name) => {
    return name
      ?.split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "ST";
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: "bg-emerald-100 text-emerald-700 border-emerald-200",
      inactive: "bg-slate-100 text-slate-600 border-slate-200",
      graduated: "bg-purple-100 text-purple-700 border-purple-200",
      suspended: "bg-red-100 text-red-700 border-red-200",
    };

    return (
      <Badge variant="outline" className={statusConfig[status] || statusConfig.inactive}>
        {status || "inactive"}
      </Badge>
    );
  };

  if (!students || students.length === 0) {
    return (
      <Card className="p-12 text-center border-2 border-dashed">
        <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-700 mb-2">No Students Added</h3>
        <p className="text-sm text-slate-500 mb-4">
          This guardian hasn't added any students yet.
        </p>
        <Button variant="outline" onClick={() => navigate(`/dashboard/guardians/${guardianId}/add-student`)}>
          Add First Student
        </Button>
      </Card>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Class/Section</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Roll No.</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => (
                <TableRow key={student._id} className="hover:bg-slate-50">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10 border-2 border-white shadow-sm">
                        {student.photo ? (
                          <img src={student.photo} alt={student.name} />
                        ) : (
                          <AvatarFallback className="bg-gradient-to-br from-indigo-100 to-indigo-200 text-indigo-700">
                            {getInitials(student.name)}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div>
                        <p className="font-medium text-slate-800">{student.name}</p>
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {student.email || "N/A"}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-sm">
                        <BookOpen className="w-3 h-3 text-slate-400" />
                        <span>{student.className || "N/A"}</span>
                      </div>
                      {student.sectionName && (
                        <div className="flex items-center gap-1 text-xs text-slate-500">
                          <Users className="w-3 h-3" />
                          <span>{student.sectionName}</span>
                        </div>
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-sm">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{student.mobile || "N/A"}</span>
                      </div>
                      {student.dob && (
                        <div className="flex items-center gap-1 text-xs text-slate-500">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(student.dob).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge variant="outline" className="font-mono">
                      {student.rollNumber || "—"}
                    </Badge>
                  </TableCell>

                  <TableCell>{getStatusBadge(student.status)}</TableCell>

                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => navigate(`/dashboard/students/${student._id}`)}
                        className="h-8 w-8"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>

                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => onEdit?.(student._id, student)}
                        className="h-8 w-8"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="icon" variant="ghost" className="h-8 w-8">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => setDeleteId(student._id)}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Student</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this student? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDelete(deleteId);
                setDeleteId(null);
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default StudentTable;
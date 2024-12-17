import { Schema, model } from "mongoose";
import { Student } from "../../interfaces/Student";

const studentSchema = new Schema<Student>({
    userName: String,
    sid: String,
    name: String,
    department: String,
    grade: String,
    class: String,
    Email: String,
    absences: { type: Number, default: 0 }, 
});

export const studentsModel = model<Student>("Student", studentSchema);

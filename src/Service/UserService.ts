import { Service } from "../abstract/Service";
import { DBResp } from "../interfaces/DBResp";
import { Student } from "../interfaces/Student";
import { studentsModel } from "../orm/schemas/studentSchemas";
import { resp } from "../utils/resp";

type seatInfo = {
    schoolName: string,
    department: string,
    seatNumber: string
};

export class UserService extends Service {

    // 取得所有學生
    public async getAllStudents(): Promise<Array<DBResp<Student>> | undefined> {
        try {
            const res: Array<DBResp<Student>> = await studentsModel.find({});
            return res;
        } catch (error) {
            return undefined;
        }
    }

    /**
     * 更新用戶姓名與缺席次數
     * @param id 用戶ID
     * @param name 新名字
     * @param absences 缺席次數
     * @returns 更新結果
     */
    public async updateNameByID(id: string, name: string, absences: number) {
        const response: resp<DBResp<Student> | string> = {
            code: 200,
            message: "",
            body: "",
        };

        try {
            // 查詢用戶
            const user = await studentsModel.findById(id);

            if (user) {
                // 更新字段
                user.name = name || user.name;
                user.absences = absences ?? user.absences;

                await user.save();

                // 轉換結果，去除 Mongoose 特性並確保 _id 是字串
                const result: DBResp<Student> = {
                    ...user.toObject(), // 將 Mongoose Document 轉換為純物件
                    _id: user._id.toString(), // 確保 _id 是 string
                };

                response.body = result;
                response.message = "更新成功";
            } else {
                response.code = 404;
                response.message = "找不到該用戶，請確認 ID 是否正確。";
            }
        } catch (error) {
            console.error("更新用戶時發生錯誤:", error);
            response.code = 500;
            response.message = "伺服器錯誤，更新失敗。";
        }

        return response;
    }

    /**
     * 新增學生
     * @param info 學生資訊
     * @returns resp
     */
    public async insertOne(info: Student): Promise<resp<DBResp<Student> | undefined>> {
        const current = await this.getAllStudents();
        const resp: resp<DBResp<Student> | undefined> = {
            code: 200,
            message: "",
            body: undefined
        };

        if (current && current.length > 0) {
            try {
                const nameValidator = await this.userNameValidator(info.userName);
                if (current.length >= 200) {
                    resp.message = "student list is full";
                    resp.code = 403;
                } else {
                    if (nameValidator === "驗證通過") {
                        info.sid = String(current.length + 1);
                        info._id = undefined;
                        const res = new studentsModel(info);
                        resp.body = await res.save();
                    } else {
                        resp.code = 403;
                        resp.message = nameValidator;
                    }
                }
            } catch (error) {
                resp.message = "server error";
                resp.code = 500;
            }
        } else {
            resp.message = "server error";
            resp.code = 500;
        }

        return resp;
    }

    /**
     * 刪除一筆用戶
     * @param id 用戶_id 
     * @returns resp<any> 
     */
    public async deleteById(id: string) {
        const resp: resp<any> = {
            code: 200,
            message: "",
            body: undefined
        };

        try {
            const res = await studentsModel.deleteOne({ _id: id });
            resp.message = "success";
            resp.body = res;
        } catch (error) {
            resp.message = error as string;
            resp.code = 500;
        }
        return resp;
    }

    // 學生名字驗證器
    public async userNameValidator(userName: string): Promise<
        '學生名字格式不正確，應為 tku + 科系縮寫 + 四碼座號，例如: tkubm1760' | '座號已存在' | '校名必須為 tku' | '座號格式不正確，必須為四位數字。' | '驗證通過'
    > {

        if (userName.length < 7) {
            return ('學生名字格式不正確，應為 tku + 科系縮寫 + 四碼座號，例如: tkubm1760');
        }

        const info = this.userNameFormator(userName);

        if (info.schoolName !== 'tku') {
            return '校名必須為 tku';
        }

        const seatNumberPattern = /^\d{4}$/;

        if (!seatNumberPattern.test(info.seatNumber)) {
            return '座號格式不正確，必須為四位數字。';
        }

        if (await this.existingSeatNumbers(info.seatNumber)) {
            return '座號已存在';
        }

        return '驗證通過';
    }

    public userNameFormator(userName: string) {
        const info: seatInfo = {
            schoolName: userName.slice(0, 3),
            department: userName.slice(3, userName.length - 4),
            seatNumber: userName.slice(-4)
        };
        return info;
    }

    public async existingSeatNumbers(SeatNumber: string): Promise<boolean> {
        const students = await this.getAllStudents();
        let exist = false;
        if (students) {
            students.forEach((student) => {
                const info = this.userNameFormator(student.userName);
                if (info.seatNumber === SeatNumber) {
                    exist = true;
                }
            });
        }
        return exist;
    }
}

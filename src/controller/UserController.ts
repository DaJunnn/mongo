import { Request, Response } from "express";
import { Contorller } from "../abstract/Contorller";
import { DBResp } from "../interfaces/DBResp";
import { Student } from "../interfaces/Student";
import { UserService } from "../Service/UserService";
import { resp } from "../utils/resp";
require('dotenv').config();

export class UserController extends Contorller {
    protected service: UserService;

    constructor() {
        super();
        this.service = new UserService();
    }

    // 取得所有學生資料
    public async findAll(Request: Request, Response: Response) {
        const res: resp<Array<DBResp<Student>> | undefined> = {
            code: 200,
            message: "",
            body: undefined,
        };

        const dbResp = await this.service.getAllStudents();
        if (dbResp) {
            res.body = dbResp;
            res.message = "find success";
            Response.send(res);
        } else {
            res.code = 500;
            res.message = "server error";
            Response.status(500).send(res);
        }
    }

    // 新增一名學生
    public async insertOne(Request: Request, Response: Response) {
        const resp = await this.service.insertOne(Request.body);
        Response.status(resp.code).send(resp);
    }
    
    public async deleteById(Request: Request, Response: Response) {
        const resp = await this.service.deleteById(Request.query.id as string);
        Response.status(resp.code).send(resp);
    }
    
    public async updateNameByID(Request: Request, Response: Response) {
        const { id, name, absences } = Request.body;
        const resp = await this.service.updateNameByID(id, name, absences);
        Response.status(resp.code).send(resp);
    }
    
}

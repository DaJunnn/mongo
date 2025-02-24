import { Route } from "../abstract/Route";
import { UserController } from "../controller/UserController";

export class UserRoute extends Route{
    
    protected url: string;
    protected Contorller = new UserController();

    constructor(){
        super()
        this.url = '/api/v1/user/'
        this.setRoutes()
    }

    protected setRoutes(): void {
        
        this.router.get(`${this.url}findAll`,(req, res)=>{
            this.Contorller.findAll(req, res);
        })

        /**
         * 新增學生
         * request body {
         *  userName: string,
         *  name: string",
         *  department: string,
         *  grade: string,
         *  class: string,
         *  Email: string
         * } 
         * @returns resp<Student>
         */
        this.router.post(`${this.url}insertOne`,(req, res)=>{
            this.Contorller.insertOne(req, res);
        })
        this.router.delete(`${this.url}deleteById`,(req, res)=>{
            this.Contorller.deleteById(req, res);
        })
        this.router.put(`${this.url}updateNameByID`,(req, res)=>{
            this.Contorller.updateNameByID(req, res);
        })
    }
}
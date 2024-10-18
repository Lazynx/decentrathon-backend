import ITest from "../Test/CreateTest.dto";

export default interface ITopic {
    topic: string;
    conspect: string;
    tests: ITest[];
    is_completed: boolean;
}
  
import { Branch, CreateBranchDto, UpdateBranchDto } from "../types";
declare class BranchService {
    getAllBranches(): Promise<Branch[]>;
    getBranchById(id: string | number): Promise<Branch>;
    createBranch(branchData: CreateBranchDto): Promise<Branch>;
    updateBranch(id: string | number, branchData: UpdateBranchDto): Promise<Branch>;
    deleteBranch(id: string | number): Promise<Branch>;
    activateBranch(id: string | number): Promise<Branch>;
}
declare const _default: BranchService;
export default _default;

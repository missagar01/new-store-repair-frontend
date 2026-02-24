// Store GRN Approval API Services
import { apiRequest } from "../config/api";


export interface StoreGRNApproval {
    planned_date?: string;      // timestamp
    grn_no?: string;
    grn_date?: string;          // date
    party_name?: string;
    party_bill_no?: string;

    sended_bill?: boolean;
    approved_by_admin?: boolean;
    approved_by_gm?: boolean;
    close_bill?: boolean;
}

export interface StoreGRNApprovalResponse {
    success: boolean;
    total?: number;
    data?: StoreGRNApproval | StoreGRNApproval[];
    message?: string;
}

export const storeGRNApprovalApi = {
    /* READ ALL */
    getAll: async (): Promise<StoreGRNApprovalResponse> => {
        return apiRequest<StoreGRNApprovalResponse>("/store-grn-approval", {
            method: "GET",
        });
    },

    sendBill: async (
        data: StoreGRNApproval
    ): Promise<StoreGRNApprovalResponse> => {
        return apiRequest<StoreGRNApprovalResponse>(
            "/store-grn-approval/send-bill",
            {
                method: "POST",
                body: JSON.stringify(data),
            }
        );
    },


    /* PATCH – APPROVED BY GM */
    approveByGM: async (
        grnNo: string
    ): Promise<StoreGRNApprovalResponse> => {
        return apiRequest<StoreGRNApprovalResponse>(
            `/store-grn-approval/approve-gm/${grnNo}`,
            {
                method: "PATCH",
            }
        );
    },

    /* PATCH – CLOSE BILL */
    closeBill: async (
        grnNo: string
    ): Promise<StoreGRNApprovalResponse> => {
        return apiRequest<StoreGRNApprovalResponse>(
            `/store-grn-approval/close-bill/${grnNo}`,
            {
                method: "PATCH",
            }
        );
    },
};

export const calculateRFM = (opportunities) => {
    // logic based on PHITEN_UPDATE logic
    // 1. Reference date: TODAY
    const today = new Date();

    // Group by customer id (Mã KH)
    const custStats = {};

    opportunities.forEach(opp => {
        // Ưu tiên 'lastPurchaseDate' (Ngày mua hàng gần nhất) cho Recency
        // Fallback sang 'expCloseDate' (Ngày mua hàng đầu tiên) nếu không có
        if (opp.revenue > 0) {
            const dateStr = opp.lastPurchaseDate || opp.expCloseDate;
            if (!dateStr) return;
            const parts = dateStr.split('/'); // DD/MM/YYYY
            if (parts.length === 3) {
                const oppDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
                if (isNaN(oppDate.getTime())) return;
                const rDays = Math.floor((today - oppDate) / (1000 * 3600 * 24));

                // firstDate dùng expCloseDate (Ngày mua đầu tiên) cho F
                const firstDateStr = opp.expCloseDate || dateStr;
                const firstParts = firstDateStr.split('/');
                const firstDate = firstParts.length === 3
                    ? new Date(`${firstParts[2]}-${firstParts[1]}-${firstParts[0]}`)
                    : oppDate;

                if (!custStats[opp.id]) {
                    custStats[opp.id] = {
                        id: opp.id,
                        latestDate: oppDate,
                        r: rDays,
                        f: 0,
                        m: 0
                    };
                } else {
                    if (oppDate > custStats[opp.id].latestDate) {
                        custStats[opp.id].latestDate = oppDate;
                        custStats[opp.id].r = rDays;
                    }
                }
                custStats[opp.id].f += 1;
                custStats[opp.id].m += opp.revenue;
            }
        }
    });

    // Calculate segments and auto columns
    const analyzed = Object.values(custStats).map(c => {
        const { r, f, m } = c;

        // Auto
        const active12m = r < 365 ? 'Yes' : 'No';
        const repeatCustomer = f > 1 ? 'Yes' : 'No';

        let revBucket = '<2M';
        if (m >= 20000000) revBucket = '20M+';
        else if (m >= 10000000) revBucket = '10-20M';
        else if (m >= 5000000) revBucket = '5-10M';
        else if (m >= 2000000) revBucket = '2-5M';

        let segment = 'Other';
        if (r <= 90 && f >= 3 && m >= 10000000) {
            segment = 'VIP';
        } else if (r < 365 && (f >= 2 || m >= 2000000)) {
            segment = 'Loyal';
        } else if (r >= 365 && r < 730) {
            segment = 'At Risk';
        } else if (r >= 730) {
            segment = 'Lost';
        } else {
            segment = 'New/Promising';
        }

        return { ...c, active12m, repeatCustomer, revBucket, segment };
    });

    return analyzed;
};

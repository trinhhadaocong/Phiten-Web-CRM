CREATE TABLE IF NOT EXISTS `customers` (
  `customer_id` VARCHAR(50) NOT NULL PRIMARY KEY,         -- Mã KH
  `name` VARCHAR(100) DEFAULT NULL,                      -- Tên KH
  `phone` VARCHAR(20) DEFAULT NULL,                      -- SĐT
  `email` VARCHAR(100) DEFAULT NULL,                     -- E-mail
  `address` TEXT DEFAULT NULL,                           -- Địa chỉ
  `location` VARCHAR(100) DEFAULT NULL,                   -- Vị trí
  `gender` VARCHAR(10) DEFAULT NULL,                     -- Giới tính
  `member_date` DATE DEFAULT NULL,                       -- Ngày Thành Viên
  `birthday` DATE DEFAULT NULL,                          -- Ngày sinh
  `membership` VARCHAR(50) DEFAULT NULL,                 -- Thành viên
  `status` VARCHAR(50) DEFAULT NULL,                     -- Tình trạng
  `sports` TEXT DEFAULT NULL,                            -- Thể thao
  `channel` VARCHAR(50) DEFAULT NULL,                    -- Channel
  `account` VARCHAR(50) DEFAULT NULL,                    -- Account
  `zalo_oa` VARCHAR(50) DEFAULT NULL,                    -- Follow Zalo Oa
  `medical` TEXT DEFAULT NULL,                           -- Tổng hợp bệnh lý
  `job` VARCHAR(100) DEFAULT NULL,                       -- Nghề nghiệp
  `foreign_cust` VARCHAR(50) DEFAULT NULL,               -- KH nước ngoài
  `note` TEXT DEFAULT NULL,                              -- Ghi chú khác
  `assignee` VARCHAR(100) DEFAULT NULL,                  -- Người phụ trách
  `revenue` DECIMAL(15, 2) DEFAULT 0.00,                 -- Doanh thu
  `stage` VARCHAR(50) DEFAULT NULL,                      -- Giai đoạn
  `first_purchase_date` DATE DEFAULT NULL,               -- Ngày mua hàng đầu tiên
  `last_purchase_date` DATE DEFAULT NULL,                -- Ngày mua hàng gần nhất
  
  -- RFM & Segmentation Columns
  `number_of_orders` INT DEFAULT 0,
  `recency_days` INT DEFAULT 9999,
  `aov` DECIMAL(15, 2) DEFAULT 0.00,
  `segment` ENUM('VIP', 'Loyal', 'At Risk', 'Lost', 'New') DEFAULT 'New',

  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Indexing for RFM speed
  INDEX `idx_stage` (`stage`),
  INDEX `idx_last_date` (`last_purchase_date`),
  INDEX `idx_segment` (`segment`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Stored Procedure to calculate segments
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS calculate_segments()
BEGIN
    -- Update Recency
    UPDATE customers 
    SET recency_days = DATEDIFF(CURDATE(), last_purchase_date)
    WHERE last_purchase_date IS NOT NULL;

    -- Update Segmentation Logic
    UPDATE customers
    SET segment = CASE 
        WHEN recency_days <= 90 AND aov >= 10000000 THEN 'VIP'
        WHEN recency_days <= 180 AND number_of_orders >= 2 THEN 'Loyal'
        WHEN recency_days BETWEEN 91 AND 180 THEN 'At Risk'
        WHEN recency_days > 180 THEN 'Lost'
        ELSE 'New'
    END;
END //
DELIMITER ;

-- Optional: Initial test data insert
-- INSERT INTO customers (customer_id, name, total_spend) VALUES ('KH-TEST-01', 'Test User', 1000000);

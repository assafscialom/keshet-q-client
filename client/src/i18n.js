const translations = {
  he: {
    // Shortcuts
    shortcut_cashier: 'כניסת קופאי',
    shortcut_sorter: 'כניסת אורז',

    // Home page
    department: 'מחלקה',
    search: 'חיפוש',
    no_departments: 'אין מחלקות להצגה',
    loading_departments: 'טוען מחלקות...',
    loading_order_history: 'טוען היסטוריית הזמנות...',

    // Cashier new order
    new_order: 'הזמנה חדשה',
    customer_name_placeholder: 'שם פרטי ושם משפחה',
    barcode_scan: 'סריקת ברקוד',
    search_by_name: 'חיפוש לפי שם',
    add_to_order: '+ הוסף להזמנה',
    added_to_basket: 'נוסף לסל',
    no_products: 'אין מוצרים להצגה',
    no_items_selected: 'לא נבחרו מוצרים עדיין',
    no_branch_dept: 'נדרש לבחור סניף ומחלקה לפני חיפוש מוצרים.',
    create_order: '✓ צור הזמנה',
    creating_order: 'יוצר הזמנה...',
    cancel_btn: '✕ בטל',

    // Order table columns
    col_num: '№',
    col_sku: 'מקליט',
    col_name: 'שם',
    col_note: 'הערה',
    col_cut_type: 'אופן חיתוך',
    col_quantity: 'כמות',
    col_metrics: 'מדדים',
    col_actions: 'פעולות',

    // Product detail popup
    quantity: 'כמות',
    cut_type: 'אופן חיתוך',
    note: 'הערה',
    none: 'ללא',

    // Cashier history
    history: 'היסטוריה',
    end_shift: 'סגירת משמרת',
    loading_orders: 'טוען הזמנות...',
    loading_items: 'טוען פריטים...',
    no_items: 'אין פריטים להצגה',
    no_orders: 'אין הזמנות להצגה',
    no_comment: 'אין תגובה',
    reprint: '🖨 הדפסה חוזרת',
    create_new_order: 'צור הזמנה חדשה',
    search_order_placeholder: 'נא להכניס מספר הזמנה לחיפוש',
    search_order: 'חיפוש הזמנה',

    // Shift modals
    cashier_shift_modal_title: 'כניסת קופאי',
    sorter_shift_modal_title: 'כניסת אורז',
    enter_name_prompt: 'הזן את שמך כדי להתחיל',
    full_name: 'שם מלא',
    start_shift: 'התחל משמרת',
    end_shift_confirm: 'האם אתה בתוך פעולת יציאת משמרת?',
    yes_exit_shift: 'כן, צא ממשמרת',
    no_cancel: 'לא, בטל',

    // Sorter
    sort_items: 'סדר פריטים',
    name_label: 'שם:',
    barcode_label: 'ברקוד:',
    quantity_label: 'כמות:',
    cut_type_label: 'סוג חיתוך:',
    note_label: 'הערה:',

    // Sorter aria labels
    collected_aria: 'נאסף',
    packed_aria: 'נארז',

    // Sorter validation messages
    sorter_must_open: 'יש לפתוח את ההזמנה ולסמן את כל הפריטים לפני הסגירה',
    sorter_collected_of: 'נאספו',
    sorter_mark_all: 'יש לסמן את כולם',

    // Board TV
    board_tagline: 'ברוכים הבאים — קחו מספר והמתינו לקריאה',
    in_progress_col: 'בהכנה',
    done_col: 'מוכנות',
    waiting: 'ממתינים',
    ready_count: 'מוכנות',
    next_in_progress: 'הבא בהכנה',
    order_label: 'הזמנה',
    display_settings: 'הגדרות תצוגה',
    orders_per_slide: 'מספר הזמנות לפני סלייד',
    save_and_close: 'שמור וסגור',
    show_orders: 'צג הזמנות',
  },

  en: {
    // Shortcuts
    shortcut_cashier: 'Cashier Entry',
    shortcut_sorter: 'Sorter Entry',

    // Home page
    department: 'Department',
    search: 'Search',
    no_departments: 'No departments to display',
    loading_departments: 'Loading departments...',
    loading_order_history: 'Loading order history...',

    // Cashier new order
    new_order: 'New Order',
    customer_name_placeholder: 'First and last name',
    barcode_scan: 'Scan barcode',
    search_by_name: 'Search by name',
    add_to_order: '+ Add to order',
    added_to_basket: 'Added to basket',
    no_products: 'No products to display',
    no_items_selected: 'No products selected yet',
    no_branch_dept: 'Please select a branch and department before searching for products.',
    create_order: '✓ Create Order',
    creating_order: 'Creating order...',
    cancel_btn: '✕ Cancel',

    // Order table columns
    col_num: '№',
    col_sku: 'SKU',
    col_name: 'Name',
    col_note: 'Note',
    col_cut_type: 'Cut Type',
    col_quantity: 'Qty',
    col_metrics: 'Unit',
    col_actions: 'Actions',

    // Product detail popup
    quantity: 'Quantity',
    cut_type: 'Cut Type',
    note: 'Note',
    none: 'None',

    // Cashier history
    history: 'History',
    end_shift: 'End Shift',
    loading_orders: 'Loading orders...',
    loading_items: 'Loading items...',
    no_items: 'No items to display',
    no_orders: 'No orders to display',
    no_comment: 'No comment',
    reprint: '🖨 Reprint',
    create_new_order: 'Create New Order',
    search_order_placeholder: 'Enter order number to search',
    search_order: 'Search Order',

    // Shift modals
    cashier_shift_modal_title: 'Cashier Login',
    sorter_shift_modal_title: 'Sorter Login',
    enter_name_prompt: 'Enter your name to start',
    full_name: 'Full name',
    start_shift: 'Start Shift',
    end_shift_confirm: 'Are you ending your shift?',
    yes_exit_shift: 'Yes, end shift',
    no_cancel: 'No, cancel',

    // Sorter
    sort_items: 'Sort Items',
    name_label: 'Name:',
    barcode_label: 'Barcode:',
    quantity_label: 'Qty:',
    cut_type_label: 'Cut type:',
    note_label: 'Note:',

    // Sorter aria labels
    collected_aria: 'Collected',
    packed_aria: 'Packed',

    // Sorter validation messages
    sorter_must_open: 'Please open the order and check all items before closing',
    sorter_collected_of: 'Collected',
    sorter_mark_all: 'please check all items',

    // Board TV
    board_tagline: 'Welcome — take a number and wait to be called',
    in_progress_col: 'In Progress',
    done_col: 'Ready',
    waiting: 'Waiting',
    ready_count: 'Ready',
    next_in_progress: 'Next up',
    order_label: 'Order',
    display_settings: 'Display Settings',
    orders_per_slide: 'Orders per slide',
    save_and_close: 'Save & Close',
    show_orders: 'Show Orders',
  },

  th: {
    // Shortcuts
    shortcut_cashier: 'เข้าสู่แคชเชียร์',
    shortcut_sorter: 'เข้าสู่การจัดเรียง',

    // Home page
    department: 'แผนก',
    search: 'ค้นหา',
    no_departments: 'ไม่มีแผนก',
    loading_departments: 'กำลังโหลดแผนก...',
    loading_order_history: 'กำลังโหลดประวัติคำสั่งซื้อ...',

    // Cashier new order
    new_order: 'คำสั่งซื้อใหม่',
    customer_name_placeholder: 'ชื่อและนามสกุล',
    barcode_scan: 'สแกนบาร์โค้ด',
    search_by_name: 'ค้นหาตามชื่อ',
    add_to_order: '+ เพิ่มในคำสั่งซื้อ',
    added_to_basket: 'เพิ่มในตะกร้าแล้ว',
    no_products: 'ไม่มีสินค้าที่จะแสดง',
    no_items_selected: 'ยังไม่ได้เลือกสินค้า',
    no_branch_dept: 'กรุณาเลือกสาขาและแผนกก่อนค้นหาสินค้า',
    create_order: '✓ สร้างคำสั่งซื้อ',
    creating_order: 'กำลังสร้างคำสั่งซื้อ...',
    cancel_btn: '✕ ยกเลิก',

    // Order table columns
    col_num: '№',
    col_sku: 'SKU',
    col_name: 'ชื่อ',
    col_note: 'หมายเหตุ',
    col_cut_type: 'วิธีตัด',
    col_quantity: 'ปริมาณ',
    col_metrics: 'หน่วย',
    col_actions: 'การดำเนินการ',

    // Product detail popup
    quantity: 'ปริมาณ',
    cut_type: 'วิธีตัด',
    note: 'หมายเหตุ',
    none: 'ไม่มี',

    // Cashier history
    history: 'ประวัติ',
    end_shift: 'สิ้นสุดกะ',
    loading_orders: 'กำลังโหลดคำสั่งซื้อ...',
    loading_items: 'กำลังโหลดรายการ...',
    no_items: 'ไม่มีรายการ',
    no_orders: 'ไม่มีคำสั่งซื้อที่จะแสดง',
    no_comment: 'ไม่มีความคิดเห็น',
    reprint: '🖨 พิมพ์ซ้ำ',
    create_new_order: 'สร้างคำสั่งซื้อใหม่',
    search_order_placeholder: 'ใส่หมายเลขคำสั่งซื้อเพื่อค้นหา',
    search_order: 'ค้นหาคำสั่งซื้อ',

    // Shift modals
    cashier_shift_modal_title: 'เข้าสู่ระบบแคชเชียร์',
    sorter_shift_modal_title: 'เข้าสู่ระบบการจัดเรียง',
    enter_name_prompt: 'ใส่ชื่อของคุณเพื่อเริ่ม',
    full_name: 'ชื่อเต็ม',
    start_shift: 'เริ่มกะ',
    end_shift_confirm: 'คุณกำลังสิ้นสุดกะหรือไม่?',
    yes_exit_shift: 'ใช่ สิ้นสุดกะ',
    no_cancel: 'ไม่ ยกเลิก',

    // Sorter
    sort_items: 'จัดเรียงรายการ',
    name_label: 'ชื่อ:',
    barcode_label: 'บาร์โค้ด:',
    quantity_label: 'ปริมาณ:',
    cut_type_label: 'วิธีตัด:',
    note_label: 'หมายเหตุ:',

    // Sorter aria labels
    collected_aria: 'เก็บแล้ว',
    packed_aria: 'แพ็คแล้ว',

    // Sorter validation messages
    sorter_must_open: 'กรุณาเปิดคำสั่งซื้อและทำเครื่องหมายสินค้าทั้งหมดก่อนปิด',
    sorter_collected_of: 'เก็บแล้ว',
    sorter_mark_all: 'กรุณาทำเครื่องหมายทั้งหมด',

    // Board TV
    board_tagline: 'ยินดีต้อนรับ — รับหมายเลขและรอการเรียก',
    in_progress_col: 'กำลังเตรียม',
    done_col: 'พร้อม',
    waiting: 'รอ',
    ready_count: 'พร้อม',
    next_in_progress: 'ถัดไป',
    order_label: 'คำสั่งซื้อ',
    display_settings: 'การตั้งค่าการแสดงผล',
    orders_per_slide: 'คำสั่งซื้อต่อสไลด์',
    save_and_close: 'บันทึกและปิด',
    show_orders: 'แสดงคำสั่งซื้อ',
  },
};

export default translations;

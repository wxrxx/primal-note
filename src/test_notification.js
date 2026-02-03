
import { useNotification } from '../contexts/NotificationContext';

// ... inside a component
const { success, error, info } = useNotification();
// success('บันทึกข้อมูลเรียบร้อย');

/* 提供原生系统时间与数据，独立暴露 */
/* 文件目录：JASPERBLOG/overall-situation/equipment.js */
const equipment = {
    getCurrentTime: function() {
        const now = new Date();
        return String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
    },
    getCurrentDate: function() {
        const now = new Date();
        return now.getFullYear() + '年' + String(now.getMonth() + 1).padStart(2, '0') + '月' + String(now.getDate()).padStart(2, '0') + '日';
    }
};
window.equipment = equipment;
import Person from './pages/menu/Person.vue';
import Record from './pages/menu/Record.vue';

const menu = [
  {
    icon: 'person',
    title: '住户',
    path: '/person',
    component: Person,
  },
  {
    icon: 'clipboard',
    title: '记录',
    path: '/record',
    component: Record,
  },
];
export default menu;

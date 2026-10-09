import 'vant/lib/index.css';
import {
  Badge,
  Button,
  Cell,
  CellGroup,
  ConfigProvider,
  Grid,
  GridItem,
  Icon,
  NavBar,
  NoticeBar,
  Progress,
  Space,
  Step,
  Steps,
  Swipe,
  SwipeItem,
  Tab,
  Tabbar,
  TabbarItem,
  Tabs,
  Tag
} from 'vant';

export default defineNuxtPlugin(({ vueApp }) => {
  [
    ConfigProvider,
    NavBar,
    Tabbar,
    TabbarItem,
    Icon,
    Button,
    Tag,
    Tabs,
    Tab,
    Progress,
    Cell,
    CellGroup,
    Grid,
    GridItem,
    Badge,
    Swipe,
    SwipeItem,
    NoticeBar,
    Space,
    Steps,
    Step
  ].forEach(component => vueApp.use(component));
});

<style lang="less">
@import "../assets/less/global.less";

aside {
  position: relative;
  background-color: @aside-color;
  box-shadow: 0 0 7px #000;
  .layout-menu-left {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 40px;
  }
}
</style>

<template>
  <aside>
    <Menu
      ref="menu"
      @on-select="selectMenu"
      theme="dark"
      width="100%"
      :active-name="activeMenuName"
      accordion
      class="layout-menu-left"
    >
      <Menu-item
        v-for="(menu, index) in MENU"
        :name="menu.path"
        :key="index"
      >
        <Tooltip
          :content="menu.title"
          placement="right"
          :delay="800"
        >
          <Icon
            :type="menu.icon"
            :size="20"
          ></Icon>
        </Tooltip>
      </Menu-item>
    </Menu>
  </aside>
</template>

<script>
import MENU from '../menu';

export default {
  data() {
    return {
      MENU,
      activeMenuName: '',
    };
  },
  methods: {
    selectMenu(path) {
      this.$router.push({ path });
    },
  },
  watch: {
    $route() {
      this.activeMenuName = this.$route.path;
      this.$nextTick(() => {
        this.$refs.menu.updateActiveName();
      });
    },
  },
  created() {
    this.activeMenuName = this.$route.path;
    this.$nextTick(() => {
      this.$refs.menu.updateActiveName();
    });
  },
};
</script>

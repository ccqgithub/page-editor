<template lang="html">
<div class="app" id="app">
  <!-- loading -->
  <div class="loading" v-if="isLoading">
    loading...
  </div>

  <div class="content pe-theme-default" :class="[size, 'is-size-' + size]" data-editable data-name="content" v-html="pageInfo.content">

  </div>

  <div class="size-ctrl">
    <a href="javascript:;" :class="{active: size == ''}" @click="changeSize('')">小</a>
    <a href="javascript:;" :class="{active: size == 'md'}" @click="changeSize('md')">中</a>
    <a href="javascript:;" :class="{active: size == 'lg'}" @click="changeSize('lg')">大</a>
  </div>
</div>
</template>

<script>
import $ from 'jquery';
import ContentTools from '../lib/content-tools';

export default {
  data() {
    return {
      isLoading: false,
      pageInfo: window.pageInfo,
      size: '',
    }
  },
  mounted: function() {
    let self = this;
    let editor = ContentTools
      .EditorApp
      .get();

    editor.init('*[data-editable]', 'data-name');

    editor.addEventListener('saved', function(ev) {
      var name,
        payload,
        regions,
        xhr;

      // Check that something changed
      regions = ev
        .detail()
        .regions;

      if (Object.keys(regions).length == 0) {
        return;
      }

      // Set the editor as busy while we save our changes
      editor.busy(true);
      self.isLoading = true;
      $.ajax({
        url: '/api/editPageContent',
        type: 'post',
        data: {
          _id: self.pageInfo._id,
          content: regions['content']
        }
      }).done(function(data) {
        editor.busy(false);
        self.isLoading = false;

        if (data.status != 200) {
          alert(data.message);
          return;
        }

        alert('保存成功');
      }.bind(this)).fail(function(error) {
        editor.busy(false);
        self.isLoading = false;

        alert('error');
      }.bind(this));
    });
  },
  methods: {
    changeSize(size) {
      this.size = size;
    }
  }
}
</script>

<style lang="less">
*, *::before, *::after {
  box-sizing: inherit;
  padding: 0;
  margin: 0;
}
html {
  font-size: 14px;
  box-sizing: border-box;
  height: 100%;
}
body {
  height: 100%;
  background: rgb(37, 36, 38);
}

.size-ctrl {
  position: fixed;
  left: 0;
  bottom: 100px;
  width: 30px;
  z-index: 99;
  background: rgba(232, 232, 232, 0.9);

  a {
    display: block;
    text-align: center;
    line-height: 30px;
    text-decoration: none;
    color: #666;
    border-bottom: 1px solid #999;

    &.active {
      background: #2980b9;
      color: #fff;
    }

    &:last-child {
      border: none;
    }
  }
}

/*loading*/
.loading{
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  top: 0;
  z-index: 999;
  background: rgba(0, 0, 0, 0.5);
  padding: 50px;
  text-align: center;
  color: #fff;
}

.app {
  height: 100%;
}

.content {
  width: 360px;
  height: 100%;
  overflow: auto;
  background: #fff;
  margin: 0 auto;
  padding-bottom: 50px;

  &.md {
    width: 768px;
  }

  &.lg {
    width: 1024px;
  }
}

.ce-element--type-image {
  img {
    display: inline-block;
    width: 100%!important;
    height: auto!important;
    margin: 0!important;
    vertical-align: middle;
  }

  &::after{
    display: none!important;
  }
}
</style>

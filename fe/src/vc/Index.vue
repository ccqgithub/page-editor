<template lang="html">
<div id="app">
  <!-- loading -->
  <div class="loading" v-if="isLoading">
    loading...
  </div>

  <!-- top -->
  <div class="top">
    <div class="top-line">
      <div class="top-item">
        <label>页面名称：</label>
        <input type="text" v-model="search.name" placeholder="页面名称" @change="updateList">
      </div>
      <div class="top-item">
        <button type="button" @click="updateList">搜索</button>
      </div>
      <div class="top-item">
        <button type="button" @click="addNewItem">添加</button>
      </div>
    </div>
  </div>

  <!-- list -->
  <div class="list">
    <table>
      <thead>
        <tr>
          <th width="20%">页面名称</th>
          <th width="30%">页面描述</th>
          <th width="30%">页面内容</th>
          <th width="20%">操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="addForm">
          <td>
            <textarea v-model="addForm.name" placeholder="value"></textarea>
          </td>
          <td>
            <textarea v-model="addForm.description" placeholder="value"></textarea>
          </td>
          <td>
            <textarea v-model="addForm.content" placeholder="value" readonly></textarea>
          </td>
          <td>
            <button type="button" @click="saveAdd">保存添加</button>
            <button type="button" @click="addForm = null">取消添加</button>
          </td>
        </tr>
        <tr v-for="item in table.list">
          <td>
            <div v-if="!item.editInfo.isEdit">
              {{item.name}}
            </div>
            <div v-if="item.editInfo.isEdit">
              <textarea v-model="item.editInfo.name"></textarea>
            </div>
          </td>
          <td>
            <div v-if="!item.editInfo.isEdit">
              {{item.description}}
            </div>
            <div v-if="item.editInfo.isEdit">
              <textarea v-model="item.editInfo.description"></textarea>
            </div>
          </td>
          <td>
            <a
              type="button"
              class="button"
              target="_blank"
              :href="'/pages/' + item._id"
            >
              详情
            </a>
          </td>
          <td>
            <button
              type="button"
              class="button"
              v-if="!item.editInfo.isEdit"
              @click="showEditItem(item)"
            >
              编辑
            </button>
            <button
              type="button"
              class="button"
              v-if="item.editInfo.isEdit"
              @click="saveEditItem(item)"
            >
              保存编辑
            </button>
            <button
              type="button"
              class="button"
              @click="item.editInfo.isEdit = false"
              v-if="item.editInfo.isEdit"
            >
              取消编辑
            </button>
            <button
              type="button"
              class="button"
              @click="deleteItem(item)"
              v-if="!item.editInfo.isEdit"
            >
              删除
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
</template>

<script>
import $ from 'jquery';

export default {
  data() {
    return {
      isLoading: false,

      table: {
        list: []
      },

      search: {
        name: ''
      },

      addForm: null,
    };
  },
  methods: {
    // 保存添加
    saveAdd: function() {
      if (!this.addForm.name.trim()) return;

      this.isLoading = true;
      $.ajax({
        url: '/api/addPage',
        type: 'post',
        data: {
          name: this.addForm.name.trim(),
          description: this.addForm.description.trim(),
          content: this.addForm.content.trim()
        }
      }).done(function(data) {
        this.isLoading = false;
        if (data.status != 200) {
          alert(data.message);
          return;
        }
        this.addForm = null;
        this.updateList();
      }.bind(this)).fail(function(error) {
        this.isLoading = false;
        alert('error');
      }.bind(this));
    },
    // 显示添加
    addNewItem: function() {
      this.addForm = {
        name: '',
        description: '',
        content: `<h1>页面一级标题</h1>\n<h2>1、二级标题</h2>\n<p>段落段落段落段落段落段落段落</p>\n<h2>2、二级标题</h2>\n<p>段落段落段落段落段落段落段落</p>`,
      };
    },
    // 删除
    deleteItem: function(item) {
      if (!confirm('确定删除吗？')) {
        return;
      }

      this.isLoading = true;
      $.ajax({
        url: '/api/deletePage',
        type: 'post',
        data: {
          _id: item._id,
        }
      }).done(function(data) {
        this.isLoading = false;
        if (data.status != 200) {
          alert(data.message);
          return;
        }
        this.updateList();
      }.bind(this)).fail(function(error) {
        this.isLoading = false;
        alert('error');
      }.bind(this));
    },
    // 显示编辑
    showEditItem: function(item) {
      item.editInfo.name = item.name;
      item.editInfo.description = item.description;
      item.editInfo.isEdit = true;
    },
    // 保存编辑
    saveEditItem: function(item) {
      this.isLoading = true;
      $.ajax({
        url: '/api/editPage',
        type: 'post',
        data: {
          _id: item._id,
          name: item.editInfo.name.trim(),
          description: item.editInfo.description.trim()
        }
      }).done(function(data) {
        this.isLoading = false;
        if (data.status != 200) {
          alert(data.message);
          return;
        }
        item.name = item.editInfo.name;
        item.description = item.editInfo.description;
        item.editInfo.isEdit = false;
      }.bind(this)).fail(function(error) {
        this.isLoading = false;
        alert('error');
      }.bind(this));
    },
    // 查询语言
    updateList: function() {
      this.isLoading = true;
      $.ajax({
        url: '/api/pages',
        type: 'get',
        data: {
          name: this.search.name.trim(),
        }
      }).done(function(data) {
        this.isLoading = false;
        if (data.status != 200) {
          alert(data.message);
          return;
        }

        this.table.list = data.result.map(function(item) {
          item.editInfo = {
            isEdit: false,
            name: item.value,
            description: item.description,
          }
          return item;
        });
      }.bind(this)).fail(function(error) {
        this.isLoading = false;
        alert('error');
      }.bind(this));
    }
  },
  mounted: function() {
    this.updateList();
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
}
body {
  padding: 20px;
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

/*top*/
.top {
  padding: 5px;
  border: 1px solid #ddd;
}
.top-line {
  display: flex;
  flex-wrap: wrap;
  padding: 5px 0;
}
.top select,
.top input,
.top button {
  display: inline-block;
  min-width: 150px;
  line-height: 20px;
  height: 30px;
  padding: 5px;
  vertical-align: middle;
}
.top button {
  cursor: pointer;
}
.top-item {
  margin-left: 20px;
  margin-bottom: 10px;
}

/*list*/
.list {
  margin-top: 20px;
}
table {
  table-layout: fixed;
  width: 100%;
  border-collapse: collapse;
}
table th {
  border: 1px solid #ddd;
  background: #eee;
  padding: 5px;
  text-align: left;
}
table td {
  border: 1px solid #ddd;
  padding: 5px;
}
table button {
  line-height: 20px;
  padding: 0 5px;
  cursor: pointer;
}
table textarea {
  width: 100%;
  height: 50px;
  padding: 5px;
  border: 1px solid #ddd;
}
table input {
  width: 100%;
  height: 30px;
  padding: 5px;
  border: 1px solid #ddd;
}
</style>

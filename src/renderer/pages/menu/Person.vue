<template>
  <div>
    <Form
      :label-width="90"
      inline
      @keydown.native.enter.prevent="getDataList('search')"
    >
      <FormItem label="户主">
        <Input
          v-model="search.house"
          style="width: 180px"
          clearable
        />
      </FormItem>
      <FormItem label="电话号码">
        <Input
          v-model="search.phone"
          style="width: 180px"
          clearable
        />
      </FormItem>
      <FormItem label="地址">
        <Input
          v-model="search.address"
          style="width: 180px"
          clearable
        />
      </FormItem>
      <FormItem label="备注">
        <Input
          v-model="search.remark"
          style="width: 180px"
          clearable
        />
      </FormItem>
      <FormItem :label-width="10">
        <Button
          type="primary"
          icon="ios-search"
          @click="getDataList('search')"
          title="搜索"
        ></Button>
        <Button
          style="margin-left:5px;"
          type="primary"
          icon="plus-round"
          @click="add"
          title="创建"
        ></Button>
      </FormItem>
    </Form>
    <Table
      border
      stripe
      :columns="dataList_table_column"
      :data="dataList"
      @on-sort-change="sort"
      @on-row-dblclick="tableRowDblClick"
      :loading="tableLoading"
    ></Table>
    <Page
      :total="dataListTotalCount"
      :current="searchParams.pageIndex"
      :page-size="searchParams.pageSize"
      @on-change="getDataList"
      @on-page-size-change="getDataListOnPageChange"
      :page-size-opts="[10,20,30,40,50]"
      show-total
      show-sizer
      show-elevator
      transfer
    ></Page>
    <Modal
      v-model="modalShow"
      :mask-closable="false"
      :title="modalTitle"
      @on-cancel="modalShow = false"
    >
      <div>
        <Form
          ref="formVali"
          :model="modalParams"
          :rules="ruleValidate"
          label-position="right"
          :label-width="130"
          @keydown.native.enter.prevent="enterConfirm(modalParams.id)"
        >
          <FormItem
            label="户主"
            prop="house"
          >
            <Input
              v-model.number="modalParams.house"
              placeholder="必填，长度 100 以内"
              style="width: 250px"
            />
          </FormItem>
          <FormItem
            label="电话号码"
            prop="phone"
          >
            <Input
              v-model.number="modalParams.phone"
              placeholder="必填，长度 100 以内"
              style="width: 250px"
            />
          </FormItem>
          <FormItem
            label="住址"
            prop="address"
          >
            <Input
              v-model.number="modalParams.address"
              placeholder="必填，长度 100 以内"
              style="width: 250px"
            />
          </FormItem>
          <FormItem
            label="备注"
            prop="remark"
          >
            <Input
              v-model="modalParams.remark"
              type="textarea"
              :rows="4"
              placeholder="非必填，长度 200 以内"
              style="width: 250px"
            />
          </FormItem>
        </Form>
      </div>
      <div slot="footer">
        <Button @click="modalShow = false">
          取消
        </Button>
        <Button
          type="primary"
          v-if="!modalParams.id"
          @click="addConfirm"
          :loading="modalBtnLoading"
        >确认
        </Button>
        <Button
          type="primary"
          v-if="modalParams.id"
          @click="editConfirm"
          :loading="modalBtnLoading"
        >确认
        </Button>
      </div>
    </Modal>
    <Modal
      v-model="delModalShow"
      width="370"
      @on-cancel="modalShow=false"
    >
      <p
        slot="header"
        style="color:#f60;text-align:center"
      >
        <Icon type="information-circled"></Icon>
        <span>删除确认</span>
      </p>
      <div style="text-align:center;line-height: 26px;">
        <p>将永久删除 <strong>{{modalParams.house}}</strong> ，并删除该住户所有抄表记录，且<strong>无法恢复</strong>。</p>
      </div>
      <div slot="footer">
        <Button
          type="error"
          size="large"
          long
          @click="delConfrim"
          :loading="modalBtnLoading"
        >删除</Button>
      </div>
    </Modal>
  </div>
</template>
<script>
import util from '../../utils/util';
export default {
  data() {
    return {
      tableLoading: false,
      modalBtnLoading: false,
      dataList: [],
      searchParams: {},
      modalShow: false,
      dataListTotalCount: 0,
      delModalShow: false,
      modalParams: {
        house: '',
        phone: '',
        address: '',
        remark: '',
      },
      ruleValidate: {
        house: [
          { required: true, message: '请输入 户主名' },
          { max: 100, message: '户主 长度 100 以内' },
        ],
        phone: [{ max: 100, message: '联系方式 长度 100 以内' }],
        address: [
          { required: true, message: '请输入 住址' },
          { max: 100, message: '住址 长度 100 以内' },
        ],
        remark: [{ max: 200, message: '备注 长度 200 以内' }],
      },
      search: {
        house: '',
        remark: '',
        sort: 'DESC',
        address: '',
        phone: '',
        pageIndex: 1,
        pageSize: 10,
      },
      dataList_table_column: [
        {
          title: '户主',
          key: 'house',
          align: 'center',
          sortable: 'custom',
          minWidth: 80,
        },
        {
          title: '电话号码',
          key: 'phone',
          align: 'center',
          minWidth: 180,
        },
        {
          title: '住址',
          key: 'address',
          align: 'center',
          minWidth: 180,
        },
        {
          title: '备注',
          key: 'remark',
          align: 'center',
          minWidth: 180,
          render: (h, params) => {
            const remark = params.row.remark;
            if (remark) {
              return h(
                'Tooltip',
                {
                  class: {
                    'table-tooltip': true,
                  },
                  props: {
                    delay: 800,
                  },
                },
                [
                  h('div', remark),
                  h(
                    'div',
                    {
                      style: {
                        'white-space': 'normal',
                      },
                      slot: 'content',
                    },
                    remark
                  ),
                ]
              );
            }
          },
        },
        {
          title: '创建时间',
          key: 'create_time',
          align: 'center',
          minWidth: 150,
          render: (h, params) => {
            return h('span', util.dateFilter(params.row.create_time));
          },
        },
        {
          title: '修改时间',
          key: 'update_time',
          align: 'center',
          minWidth: 150,
          render: (h, params) => {
            return h('span', util.dateFilter(params.row.update_time));
          },
        },
        {
          title: '操作',
          key: 'action',
          width: 130,
          align: 'center',
          fixed: 'right',
          render: (h, params) => {
            return h('div', [
              h('Button', {
                props: {
                  type: 'primary',
                  size: 'small',
                  icon: 'ios-list-outline',
                },
                attrs: {
                  title: '查看记录明细',
                },
                on: {
                  click: () => {
                    this.direct(params.row);
                  },
                },
              }),
              h('Button', {
                props: {
                  type: 'primary',
                  size: 'small',
                  icon: 'edit',
                },
                attrs: {
                  title: '修改',
                },
                style: {
                  'margin-left': '5px',
                },
                on: {
                  click: () => {
                    this.edit(params.row);
                  },
                },
              }),
              h('Button', {
                props: {
                  type: 'error',
                  size: 'small',
                  icon: 'trash-b',
                },
                attrs: {
                  title: '删除',
                },
                style: {
                  'margin-left': '5px',
                },
                on: {
                  click: () => {
                    this.del(params.row);
                  },
                },
              }),
            ]);
          },
        },
      ],
    };
  },
  computed: {
    modalTitle() {
      return this.modalParams.id ? '修改' : '创建';
    },
  },
  methods: {
    getDataList(method) {
      this.tableLoading = true;
      if (method === 'search') {
        this.searchParams = JSON.parse(JSON.stringify(this.search));
      }
      if (typeof method === 'number') {
        this.searchParams.pageIndex = method;
      }
      const searchParams = this.searchParams;
      let whereSQL = `WHERE house LIKE '%${
        searchParams.house
      }%' AND remark LIKE '%${searchParams.remark}%' `;
      whereSQL += ` AND phone LIKE '${
        searchParams.phone
      }%' AND address LIKE '%${searchParams.address}%'`;
      const pageSQL = `LIMIT ${
        searchParams.pageSize
      } OFFSET ${(searchParams.pageIndex - 1) * searchParams.pageSize} `;
      const orderSQL = `ORDER BY id ${searchParams.sort} `;
      const rowSQL =
        'SELECT id,house,phone,address,remark,create_time,update_time FROM PERSON ' +
        whereSQL +
        orderSQL +
        pageSQL;
      const countSQL = 'SELECT COUNT(id) AS totalCount FROM PERSON ' + whereSQL;
      this.$logger(rowSQL);
      this.$db.all(rowSQL, (err, res) => {
        if (err) {
          this.$logger(err);
          this.$Notice.error({
            title: '搜索失败',
            desc: err,
          });
        } else {
          if (!res.length && searchParams.pageIndex !== 1) {
            this.getDataList(searchParams.pageIndex - 1);
          } else {
            this.dataList = res;
          }
        }
        this.tableLoading = false;
      });
      this.$db.get(countSQL, (err, res) => {
        if (err) {
          this.$logger(err);
          this.$Notice.error({
            title: '搜索失败',
            desc: err,
          });
        } else {
          this.dataListTotalCount = res.totalCount;
        }
      });
    },
    getDataListOnPageChange(pageSize) {
      this.search.pageSize = pageSize;
      this.getDataList('search');
    },
    tableRowDblClick(row) {
      this.direct(row);
    },
    sort(v) {
      this.search.sort = v.order.toUpperCase();
      this.getDataList('search');
    },
    direct(row) {
      this.$router.push({
        path: '/record',
        query: {
          person_id: row.id,
        },
      });
    },
    enterConfirm(id) {
      if (id) {
        this.editConfirm();
      } else {
        this.addConfirm();
      }
    },
    del(row) {
      this.modalParams = {
        id: row.id,
        house: row.house,
      };
      this.delModalShow = true;
    },
    edit(row) {
      this.$refs.formVali.resetFields();
      this.modalParams = {
        id: row.id,
        house: row.house,
        phone: row.phone,
        address: row.address,
        remark: row.remark,
      };
      this.modalShow = true;
    },
    editConfirm() {
      this.$refs.formVali.validate(valid => {
        if (valid) {
          this.modalBtnLoading = true;
          const modalParams = this.modalParams;
          const SQL = `SELECT id FROM PERSON WHERE house = '${
            modalParams.house
          }'`;
          this.$db.get(SQL, (err, res) => {
            if (err) {
              this.$logger(err);
              this.$Notice.error({
                title: '搜索失败',
                desc: err,
              });
            } else {
              if (res && res.id !== modalParams.id) {
                this.$Message.warning({
                  content: '品名已存在',
                });
                this.modalBtnLoading = false;
              } else {
                const SQL = `UPDATE PERSON SET
                              house='${modalParams.house}'
                              ,phone='${modalParams.phone}'
                              ,address='${modalParams.address}'
                              ,remark='${modalParams.remark}'
                              ,update_time='${Date.now()}'
                            WHERE id = ${modalParams.id}`;
                this.$logger(SQL);
                this.$db.run(SQL, err => {
                  if (err) {
                    this.$logger(err);
                    this.$Notice.error({
                      title: '编辑失败',
                      desc: err,
                    });
                  } else {
                    this.modalShow = false;
                    this.$Message.success({
                      content: '编辑成功',
                    });
                    this.getDataList();
                  }
                  this.modalBtnLoading = false;
                });
              }
            }
          });
        }
      });
    },
    delConfrim() {
      this.$db.serialize(() => {
        this.$db.run('BEGIN');
        const deleteDetailSQL = `DELETE FROM PERSON WHERE id = ${
          this.modalParams.id
        }`;
        this.$logger(deleteDetailSQL);
        this.$db.run(deleteDetailSQL, err => {
          if (err) {
            this.$logger(err);
            this.$db.run('ROLLBACK');
            this.$Notice.error({
              title: '删除失败',
              desc: err,
            });
          }
        });
        const deleteSQL = `DELETE FROM RECORD WHERE person_id = ${
          this.modalParams.id
        }`;
        this.$logger(deleteSQL);
        this.$db.run(deleteSQL, err => {
          if (err) {
            this.$logger(err);
            this.$db.run('ROLLBACK');
            this.$Notice.error({
              title: '删除失败',
              desc: err,
            });
          }
        });
        this.$db.run('COMMIT');
        this.delModalShow = false;
        this.$Message.success({
          content: '删除成功',
        });
        this.getDataList();
      });
    },
    addConfirm() {
      this.$refs.formVali.validate(valid => {
        if (valid) {
          this.modalBtnLoading = true;
          const modalParams = this.modalParams;
          const SQL = `SELECT COUNT(id) AS totalCount from PERSON WHERE house = '${
            modalParams.house
          }'`;
          this.$db.get(SQL, (err, res) => {
            if (err) {
              this.$logger(err);
              this.$Notice.error({
                title: '搜索失败',
                desc: err,
              });
            } else {
              if (res.totalCount) {
                this.$Message.warning({
                  content: '该户主已存在',
                });
                this.modalBtnLoading = false;
              } else {
                const SQL = `INSERT INTO PERSON (house,phone,address,remark,create_time,update_time)
          VALUES ('${modalParams.house}','${modalParams.phone}','${
  modalParams.address
}','${modalParams.remark}','${Date.now()}','${Date.now()}')`;
                this.$logger(SQL);
                this.$db.run(SQL, err => {
                  if (err) {
                    this.$logger(err);
                    this.$Notice.error({
                      title: '新增失败',
                      desc: err,
                    });
                  } else {
                    this.modalShow = false;
                    this.$Message.success({
                      content: '新增成功',
                    });
                    this.getDataList(1);
                  }
                  this.modalBtnLoading = false;
                });
              }
            }
          });
        }
      });
    },
    add() {
      this.$refs.formVali.resetFields();
      this.modalParams = this.$options.data().modalParams;
      this.modalShow = true;
    },
  },
  created() {
    this.getDataList('search');
  },
};
</script>

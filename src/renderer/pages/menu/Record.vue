<template>
  <div>
    <Form
      :label-width="90"
      inline
      @keydown.native.enter.prevent="getDataList('search')"
    >
      <FormItem label="户主">
        <Select
          v-model="search.person_id"
          style="width: 180px"
          filterable
          clearable
        >
          <Option
            v-for="item in houses"
            :value="item.id"
            :key="item.id"
          >{{ item.house }}</Option>
        </Select>
      </FormItem>
      <FormItem label="状态">
        <Select
          v-model="search.status"
          style="width: 180px"
          filterable
          clearable
        >
          <Option
            key='0'
            value="0"
          >底数</Option>
          <Option
            v-for="item in statusList"
            :value="item.key"
            :key="item.key"
          >{{ item.name }}</Option>
        </Select>
      </FormItem>
      <FormItem label="日期">
        <DatePicker
          v-model="search.date"
          clearable
          type="daterange"
          placement="bottom-end"
          style="width: 180px"
        ></DatePicker>
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
          type="primary"
          icon="plus-round"
          @click="add"
          title="创建"
        ></Button>
        <Button
          type="primary"
          icon="edit"
          :disabled="!selectList.length"
          @click="editPuls"
          title="编辑"
        ></Button>
        <Button
          type="primary"
          @click="setPrice"
          :loading="priceLoading"
        >水价{{price}}￥/方</Button>
      </FormItem>
    </Form>
    <Table
      border
      stripe
      :columns="dataList_table_column"
      :data="dataList"
      :loading="tableLoading"
      @on-sort-change="sort"
      @on-selection-change="selectResult"
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
      v-model="editShow"
      :mask-closable="false"
      title="修改记录"
      @on-cancel="editShow = false"
    >
      <div>
        <Form
          ref="formChange"
          :model="modalParamsChange"
          :rules="ruleValidateChange"
          label-position="right"
          :label-width="130"
        >
          <FormItem
            label="状态"
            prop="status"
          >
            <Select
              v-model="modalParamsChange.status"
              style="width: 250px"
              filterable
            >
              <Option
                v-for="item in statusList"
                :value="item.key"
                :key="item.key"
              >{{ item.name }}</Option>
            </Select>
          </FormItem>
          <FormItem
            label="备注"
            v-if="!selectAction"
            prop="remark"
          >
            <Input
              v-model="modalParamsChange.remark"
              type="textarea"
              :rows="4"
              placeholder="非必填，长度 200 以内"
              style="width: 250px"
            />
          </FormItem>
        </Form>
      </div>
      <div slot="footer">
        <Button @click="editShow = false">
          取消
        </Button>
        <Button
          v-if="!selectAction"
          type="primary"
          @click="editForm"
          :loading="modalBtnLoading"
        >确认
        </Button>
        <Button
          v-if="selectAction"
          type="primary"
          @click="editSelect"
          :loading="modalBtnLoading"
        >确认
        </Button>
      </div>
    </Modal>
    <Modal
      v-model="modalShow"
      :mask-closable="false"
      title="添加记录"
      @on-cancel="modalShow = false"
    >
      <div>
        <Form
          ref="formVali"
          :model="modalParams"
          :rules="ruleValidate"
          label-position="right"
          :label-width="130"
        >
          <FormItem
            label="户主"
            prop="house"
          >
            <Select
              v-model="modalParams.house"
              style="width: 250px"
              filterable
            >
              <Option
                v-for="item in houses"
                :value="item.id"
                :key="item.id"
              >{{ item.house }}</Option>
            </Select>
          </FormItem>
          <FormItem
            label="抄表数"
            prop="count"
          >
            <Input
              v-model.number="modalParams.count"
              placeholder="必填，长度 100 以内"
              style="width: 250px"
            />
          </FormItem>
          <FormItem
            label="抄表日期"
            prop="date"
          >
            <DatePicker
              type="date"
              v-model.number="modalParams.date"
              format="yyyy年MM月dd日"
              placeholder="选择日期"
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
          @click="addConfirm"
          :loading="modalBtnLoading"
        >确认
        </Button>
      </div>
    </Modal>
    <Modal
      v-model="priceModalShow"
      width="370"
      @on-cancel="modalShow = false"
    >
      <p
        slot="header"
        style="color:#2253d0;text-align:center"
      >
        <Icon type="information-circled"></Icon>
        <span>设置价格</span>
      </p>
      <div style="text-align:center;line-height: 26px;">
        <Input
          v-model="price"
          style="width: 250px"
        />
      </div>
      <div slot="footer">
        <Button
          type="primary"
          size="large"
          long
          @click="savePrice"
          :loading="modalBtnLoading"
          :disabled="isNaN(price) || price.length == 0"
        >保存</Button>
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
        <p>将永久删除该记录，并删除该住户所有抄表记录，且<strong>无法恢复</strong>。</p>
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
export default {
  data() {
    return {
      priceModalShow: false,
      tableLoading: false,
      modalBtnLoading: false,
      priceLoading: false,
      modalShow: false,
      editShow: false,
      delModalShow: false,
      selectAction: false,
      price: '0.0',
      dataListTotalCount: 0,
      houses: [],
      selectList: [],
      statusList: [{ key: 1, name: '未收款' }, { key: 2, name: '已付款' }],
      modalParams: {
        house: '',
        count: '',
        date: '',
        remark: '',
      },
      modalParamsChange: {
        remark: '',
        status: '',
      },
      search: {
        status: '',
        person_id: '',
        date: '',
        remark: '',
        order: 'date',
        sort: 'DESC',
        pageIndex: 1,
        pageSize: 10,
      },
      dataList: [],
      dataList_table_column: [
        {
          type: 'selection',
          minWidth: 30,
          align: 'center',
          fixed: 'left',
        },
        {
          title: '户主',
          key: 'house',
          align: 'center',
          sortable: 'custom',
          minWidth: 80,
        },
        {
          title: '抄表日期',
          key: 'date',
          align: 'center',
          sortable: 'custom',
          minWidth: 120,
          render: (h, params) => {
            const date = new Date(params.row.date);
            return h(
              'div',
              date.getFullYear() +
                '-' +
                (date.getMonth() + 1) +
                '-' +
                date.getDate()
            );
          },
        },
        {
          title: '水表读数(方)',
          key: 'count',
          align: 'center',
          minWidth: 80,
        },
        {
          title: '用水量(方)',
          key: 'total',
          align: 'center',
          minWidth: 80,
        },
        {
          title: '单价(元)',
          key: 'price',
          align: 'center',
          minWidth: 80,
        },
        {
          title: '合币(元)',
          key: 'account',
          align: 'center',
          minWidth: 80,
          render: (h, params) => {
            return h(
              'div',
              (parseInt(params.row.total * 100) * params.row.price) / 100
            );
          },
        },
        {
          title: '状态',
          key: 'status',
          align: 'center',
          minWidth: 80,
          render: (h, params) => {
            if (params.row.status === 1) {
              return h('div', { style: { color: 'red' } }, '未收款');
            } else if (params.row.status === 2) {
              return h('div', { style: { color: 'green' } }, '已付款');
            }
            return h('div', { style: { color: 'blue' } }, '底数');
          },
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
                  icon: 'edit',
                },
                attrs: {
                  title: '修改状态',
                },
                on: {
                  click: () => {
                    this.status(params.row);
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
      ruleValidateChange: {
        status: [
          { required: true, message: '请选择要更改状态' },
          { type: 'number', message: '状态只能为正整数' },
        ],
        remark: [{ max: 200, message: '备注 长度 200 以内' }],
      },
      ruleValidate: {
        house: [
          { required: true, message: '请选择户主' },
          { type: 'number', message: '抄表数只能为正整数' },
        ],
        count: [
          { required: true, message: '请输入抄表数' },
          { type: 'number', message: '抄表数只能为正整数' },
        ],
        date: [
          {
            required: true,
            type: 'date',
            message: '请选择抄表日期',
            trigger: 'change',
          },
        ],
        remark: [{ max: 200, message: '备注 长度 200 以内' }],
      },
    };
  },
  methods: {
    getDataList(method) {
      this.tableLoading = true;
      if (method === 'search') {
        this.searchParams = JSON.parse(JSON.stringify(this.search));
      }
      const searchParams = this.searchParams;
      let whereSQL = `WHERE a.remark LIKE '%${searchParams.remark}%' `;
      searchParams.person_id
        ? (whereSQL += ` AND a.person_id = ${searchParams.person_id}`)
        : '';
      if (searchParams.date['0'] && searchParams.date['1']) {
        const start = new Date(searchParams.date['0']);
        const end = new Date(searchParams.date['1']);
        whereSQL += ` AND date < ${end.getTime()} AND date >=  ${start.getTime()} `;
      }
      [ '0', 1, 2 ].indexOf(searchParams.status) >= 0
        ? (whereSQL += ` AND status='${searchParams.status}'`)
        : null;
      const pageSQL = `LIMIT ${
        searchParams.pageSize
      } OFFSET ${(searchParams.pageIndex - 1) * searchParams.pageSize} `;
      const orderSQL = ` ORDER BY ${searchParams.order}  ${searchParams.sort} `;
      const rowSQL =
        `SELECT
              a.id,
              person_id,
              b.house,
              count,
              price,
              total,
              date,
              a.remark,
              a.create_time,
              status
            FROM
              RECORD AS a
              LEFT JOIN PERSON AS b ON a.person_id = b.id ` +
        whereSQL +
        orderSQL +
        pageSQL;
      const countSQL =
        'SELECT COUNT(a.id) AS totalCount FROM RECORD AS a ' + whereSQL;
      this.$logger(rowSQL);
      this.$db.all(rowSQL, (err, res) => {
        if (err) {
          this.$logger(err);
          this.$Notice.error({
            title: '搜索失败',
            desc: err,
          });
        } else {
          this.dataList = res;
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
    setPrice() {
      this.priceModalShow = true;
    },
    selectResult(list) {
      this.selectList = list;
    },
    status(row) {
      this.$refs.formChange.resetFields();
      this.modalParamsChange = {
        status: row.status,
      };
      this.editShow = true;
    },
    editPuls() {
      this.$refs.formChange.resetFields();
      this.modalParamsChange = {
        status: 2,
      };
      this.selectAction = true;
      this.editShow = true;
    },
    editSelect() {
      this.$refs.formChange.validate(valid => {
        if (valid) {
          this.modalBtnLoading = true;
          const params = this.modalParamsChange;
          const ids = this.selectList.map(item => item.id);
          const sql = `UPDATE RECORD SET status=${params.status} WHERE id IN(${ids.join(',')})`;
          this.$logger(sql);
          this.$db.run(sql, err => {
            if (err) {
              this.$logger(err);
              this.$Notice.error({
                title: '编辑失败',
                desc: err,
              });
            } else {
              this.$Message.success({
                content: '编辑成功',
              });
              this.getDataList();
              this.selectList = [];
              this.modalBtnLoading = false;
              this.selectAction = false;
              this.editShow = false;
            }
          });


        }
      });
    },
    editForm() {
      this.$refs.formChange.validate(valid => {
        if (valid) {
          this.modalBtnLoading = true;
          const params = this.modalParamsChange;
          const sql = `SELECT id FROM RECORD WHERE id='${params.id}'`;
          this.$db.get(sql, err => {
            if (err) {
              this.$logger(err);
              this.$Notice.error({
                title: '搜索失败',
                desc: err,
              });
            } else {
              const updatSql = `UPDATE RECORD SET status='${
                params.status
              }',remark='${params.remark}' WHERE id=${params.id}`;
              this.$logger(updatSql);
              this.$db.run(updatSql, err => {
                if (err) {
                  this.$logger(err);
                  this.$Notice.error({
                    title: '编辑失败',
                    desc: err,
                  });
                } else {
                  this.editShow = false;
                  this.$Message.success({
                    content: '编辑成功',
                  });
                  this.getDataList();
                }
                this.modalBtnLoading = false;
              });
            }
          });
        }
      });
    },
    getDataListOnPageChange(pageSize) {
      this.search.pageSize = pageSize;
      this.getDataList('search');
    },
    delConfrim() {
      const deleteDetailSQL = `DELETE FROM RECORD WHERE id = ${
        this.modalParams.id
      }`;
      this.$logger(deleteDetailSQL);
      this.$db.run(deleteDetailSQL, err => {
        if (err) {
          this.$logger(err);
          this.$Notice.error({
            title: '删除失败',
            desc: err,
          });
        } else {
          this.delModalShow = false;
          this.$Message.success({
            content: '删除成功',
          });
          this.getDataList();
        }
      });
    },
    sort(v) {
      this.search.sort = v.order.toUpperCase();
      this.search.order = v.key === 'house' ? 'person_id' : v.key;
      this.getDataList('search');
    },
    addConfirm() {
      if (!this.price) {
        this.$Notice.error({
          title: '请设置水价',
        });
        return;
      }
      this.$refs.formVali.validate(valid => {
        if (valid) {
          this.$db.serialize(() => {
            this.$db.run('BEGIN');
            this.modalBtnLoading = true;
            const modalParams = this.modalParams;
            const date = new Date(modalParams.date);
            const sql = `INSERT INTO RECORD (person_id,count,status,price,date,remark,create_time) 
            VALUES ('${modalParams.house}','${modalParams.count}',1,'${
  this.price
}','${date.getTime()}','${modalParams.remark}','${Date.now()}')`;
            this.$logger(sql);
            this.$db.run(sql, err => {
              if (err) {
                this.$logger(err);
                this.$db.run('ROLLBACK');
                this.$Notice.error({
                  title: '新增失败',
                  desc: err,
                });
              }
            });
            const sel = `SELECT id, count, total, status, date, pre FROM RECORD WHERE person_id = '${
              modalParams.house
            }' ORDER BY date ASC`;
            this.$db.all(sel, (err, res) => {
              if (err) {
                this.$logger(err);
                this.$Notice.error({
                  title: '搜索失败',
                  desc: err,
                });
              } else {
                const updates = res.map((item, index) => {
                  const tmp = item;
                  if (index === 0) {
                    tmp.total = 0;
                    tmp.status = 0;
                    tmp.pre = 0;
                  } else {
                    if (tmp.status === 0) {
                      tmp.status = 1;
                    }
                    tmp.pre = res[index - 1].date;
                    tmp.total = item.count - res[index - 1].count;
                  }
                  const sql = `UPDATE RECORD SET total='${
                    tmp.total
                  }', status='${tmp.status}', pre='${tmp.pre}' WHERE id='${tmp.id}'`;
                  return sql;
                });
                this.$logger(updates);
                this.$logger(updates.join(';'));
                const str = updates.join(';');
                this.$db.exec(str, err => {
                  if (err) {
                    this.$logger(err);
                    this.$db.run('ROLLBACK');
                    this.$Notice.error({
                      title: '添加失败',
                      desc: err,
                    });
                  }
                });
              }
            });
            this.$db.run('COMMIT');
            this.modalBtnLoading = false;
            this.modalShow = false;
            this.getDataList();
            this.$Message.success({
              content: '添加成功',
            });
          });
        }
      });
    },
    add() {
      this.$refs.formVali.resetFields();
      this.modalParams = this.$options.data().modalParams;
      this.modalShow = true;
    },
    del(row) {
      this.modalParams = {
        id: row.id,
      };
      this.delModalShow = true;
    },
    getPrice() {
      this.priceLoading = true;
      const sql = 'SELECT price FROM UNIT ORDER BY id DESC LIMIT 0,1';
      this.$logger(sql);
      this.$db.get(sql, (err, res) => {
        if (err) {
          this.$logger(err);
          this.$Notice.error({
            title: '搜索失败',
            desc: err,
          });
        } else {
          if (typeof res === 'undefined') {
            this.price = res;
          } else {
            this.price = res.price;
          }
        }
        this.priceLoading = false;
      });
    },
    getHouses() {
      const sql = 'SELECT id,house FROM PERSON';
      this.$logger(sql);
      this.$db.all(sql, (err, res) => {
        if (err) {
          this.$logger(err);
          this.$Notice.error({
            title: '搜索失败',
            desc: err,
          });
        } else {
          this.houses = res;
        }
      });
    },
    savePrice() {
      const price = this.price;
      const SQL = `INSERT INTO UNIT (price,time)VALUES ('${price}','${Date.now()}')`;
      this.$logger(SQL);
      this.$db.run(SQL, err => {
        if (err) {
          this.$logger(err);
          this.$Notice.error({
            title: '新增失败',
            desc: err,
          });
        } else {
          this.$Message.success({
            content: '新增成功',
          });
          this.getPrice();
        }
        this.priceModalShow = false;
      });
    },
  },
  created() {
    this.getPrice();
    this.getHouses();
    const person_id = this.$route.query.person_id;
    if (person_id) {
      this.search.person_id = person_id;
    }
    this.getDataList('search');
  },
};
</script>

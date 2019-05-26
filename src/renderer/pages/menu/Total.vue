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
      <FormItem :label-width="10">
        <Button
          type="primary"
          icon="ios-search"
          @click="getDataList('search')"
          title="搜索"
        ></Button>
        <Button
          type="primary"
          icon="printer"
          :disabled="!selectList.length"
          @click="printer"
          title="编辑"
        ></Button>
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
  </div>
</template>
<script>
export default {
  data() {
    return {
      tableLoading: false,
      price: '0.0',
      dataListTotalCount: 0,
      houses: [],
      selectList: [],
      statusList: [{ key: 1, name: '未收款' }, { key: 2, name: '已付款' }],
      search: {
        status: 1,
        person_id: '',
        date: '',
        order: 'person_id',
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
          title: '上次抄表(方)',
          key: 'pre',
          align: 'center',
          minWidth: 80,
        },
        {
          title: '本次抄表(方)',
          key: 'cur',
          align: 'center',
          minWidth: 80,
        },
        {
          title: '用水方量(方)',
          key: 'account',
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
          key: 'total',
          align: 'center',
          minWidth: 80,
        },
        {
          title: '上次抄表日期',
          key: 'start',
          align: 'center',
          minWidth: 120,
          render: (h, params) => {
            const date = new Date(params.row.start);
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
          title: '本次抄表日期',
          key: 'still',
          align: 'center',
          minWidth: 120,
          render: (h, params) => {
            const date = new Date(params.row.till);
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
                  icon: 'printer',
                },
                attrs: {
                  title: '打印',
                },
                on: {
                  click: () => {
                    this.printer(params.row);
                  },
                },
              }),
            ]);
          },
        },
      ],
    };
  },
  methods: {
    getDataList(method) {
      this.tableLoading = true;
      if (method === 'search') {
        this.searchParams = JSON.parse(JSON.stringify(this.search));
      }
      const searchParams = this.searchParams;
      let whereSQL = '';
      [ 1, 2 ].indexOf(searchParams.status) >= 0
        ? (whereSQL += ` WHERE status='${searchParams.status}'`)
        : (whereSQL += ' WHERE status=1');
      searchParams.person_id
        ? (whereSQL += ` AND a.person_id = ${searchParams.person_id}`)
        : '';
      if (searchParams.date['0'] && searchParams.date['1']) {
        const start = new Date(searchParams.date['0']);
        const end = new Date(searchParams.date['1']);
        whereSQL += ` AND date < ${end.getTime()} AND pre >=  ${start.getTime()} `;
      }
      whereSQL += ' GROUP BY person_id,price ';
      const pageSQL = `LIMIT ${
        searchParams.pageSize
      } OFFSET ${(searchParams.pageIndex - 1) * searchParams.pageSize} `;
      const orderSQL = ` ORDER BY ${searchParams.order}  ${searchParams.sort} `;
      const rowSQL =
        `SELECT
              person_id,
              b.house,
              status,
              a.price,
              MAX( date ) AS till,
              MIN( pre ) AS start,
              MAX( count ) AS cur,
              MIN( count - total ) AS pre,
              SUM(total) AS account,
              SUM( total * price ) AS total
            FROM
              RECORD AS a
              LEFT JOIN PERSON AS b ON a.person_id = b.id ` +
        whereSQL +
        orderSQL +
        pageSQL;
      const countSQL =
        'SELECT COUNT(DISTINCT person_id) AS totalCount FROM RECORD AS a ' + whereSQL;
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
      this.$db.all(countSQL, (err, res) => {
        if (err) {
          this.$logger(err);
          this.$Notice.error({
            title: '搜索失败',
            desc: err,
          });
        } else {
          this.dataListTotalCount = res.length;
        }
      });
    },
    selectResult(list) {
      this.selectList = list;
    },
    printer() {
      console.log('aa');
    },
    getDataListOnPageChange(pageSize) {
      this.search.pageSize = pageSize;
      this.getDataList('search');
    },
    sort(v) {
      this.search.sort = v.order.toUpperCase();
      this.getDataList('search');
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
  },
  created() {
    this.getHouses();
    const person_id = this.$route.query.person_id;
    if (person_id) {
      this.search.person_id = person_id;
    }
    this.getDataList('search');
  },
};
</script>

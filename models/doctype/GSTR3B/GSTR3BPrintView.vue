<template>
  <div>
    <div class="row no-gutters">
      <div class="col-8 mx-auto text-right mt-4">
        <f-button primary @click="$emit('makePDF', $refs.printComponent.innerHTML)">{{ t('PDF') }}</f-button>
      </div>
    </div>
    <div ref="printComponent" class="col-8 bg-white mt-4 mx-auto border shadow">
      <div class="print-format" style="padding: 3.5rem; font-size: 8pt !important;">
        <div>
          <h3 class="text-center">GSTR3B-Form</h3>
          <h5>GSTIN: &nbsp; {{ jsonData.gstin }}</h5>
          <h5>Period: &nbsp; {{ jsonData.ret_period }}</h5>
        </div>

        <h5>3.1&nbsp;&nbsp;Details of Outward Supplies and inward supplies liable to reverse charge</h5>
        <table class="table table-bordered">
          <thead>
            <tr>
              <th>Nature Of Supplies</th>
              <th>Total Taxable value</th>
              <th>Integrated Tax</th>
              <th>Central Tax</th>
              <th>State/UT Tax</th>
              <th>Cess</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>(a) Outward taxable supplies(other than zero rated, nil rated and exempted</td>
              <td class="right">{{ jsonData.sup_details.osup_det.txval }}</td>
              <td class="right">{{ jsonData.sup_details.osup_det.iamt }}</td>
              <td class="right">{{ jsonData.sup_details.osup_det.camt }}</td>
              <td class="right">{{ jsonData.sup_details.osup_det.samt }}</td>
              <td class="right">{{ jsonData.sup_details.osup_det.csamt }}</td>
            </tr>
            <tr>
              <td>(b) Outward taxable supplies(zero rated)</td>
              <td class="right">{{ jsonData.sup_details.osup_zero.txval }}</td>
              <td class="right">{{ jsonData.sup_details.osup_zero.iamt }}</td>
              <td class="disabled"></td>
              <td class="disabled"></td>
              <td class="right">{{ jsonData.sup_details.osup_zero.csamt }}</td>
            </tr>
            <tr>
              <td>(b) Other outward supplies(Nil rated,Exempted)</td>
              <td class="right">{{ jsonData.sup_details.osup_nil_exmp.txval }}</td>
              <td class="disabled"></td>
              <td class="disabled"></td>
              <td class="disabled"></td>
              <td class="disabled"></td>
            </tr>
            <tr>
              <td>(d) Inward Supplies(liable to reverse charge</td>
              <td class="right">{{ jsonData.sup_details.isup_rev.txval }}</td>
              <td class="right">{{ jsonData.sup_details.isup_rev.iamt }}</td>
              <td class="right">{{ jsonData.sup_details.isup_rev.camt }}</td>
              <td class="right">{{ jsonData.sup_details.isup_rev.samt }}</td>
              <td class="right">{{ jsonData.sup_details.isup_rev.csamt }}</td>
            </tr>
            <tr>
              <td>(e) Non-GST outward supplies</td>
              <td class="right">{{ jsonData.sup_details.osup_nongst.txval }}</td>
              <td class="disabled"></td>
              <td class="disabled"></td>
              <td class="disabled"></td>
              <td class="disabled"></td>
            </tr>
          </tbody>
        </table>

        <h5>3.2&nbsp;&nbsp;Of the supplies shown in 3.1 (a) above, details of inter-State supplies made to unregisterd persons, composition taxable persons and UIN holders</h5>
        <table class="table table-bordered">
          <thead>
            <tr>
              <th></th>
              <th>Place Of Supply (State/UT)</th>
              <th>Total Taxable Value</th>
              <th>Amount of Integrated Tax</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Supplies made to Unregistered Persons</td>
              <td class="right">
                <div v-for="(row, i) in jsonData.inter_sup.unreg_details" :key="i">
                  <p>{{ row.pos }}</p>
                </div>
              </td>
              <td class="right">
                <div v-for="(row, i) in jsonData.inter_sup.unreg_details" :key="i">
                  <p>{{ row.txval }}</p>
                </div>
              </td>
              <td class="right">
                <div v-for="(row, i) in jsonData.inter_sup.unreg_details" :key="i">
                  <p>{{ row.iamt }}</p>
                </div>
              </td>
            </tr>
            <tr>
              <td>Suppliies made to Composition Taxable Persons</td>
              <td class="right">
                <div v-for="(row, i) in jsonData.inter_sup.comp_details" :key="i">
                  <p>{{ row.pos }}</p>
                </div>
              </td>
              <td class="right">
                <div v-for="(row, i) in jsonData.inter_sup.comp_details" :key="i">
                  <p>{{ row.txval }}</p>
                </div>
              </td>
              <td class="right">
                <div v-for="(row, i) in jsonData.inter_sup.comp_details" :key="i">
                  <p>{{ row.iamt }}</p>
                </div>
              </td>
            </tr>
            <tr>
              <td>Supplies made to UIN holders</td>
              <td class="right">
                <div v-for="(row, i) in jsonData.inter_sup.uin_details" :key="i">
                  <p>{{ row.pos }}</p>
                </div>
              </td>
              <td class="right">
                <div v-for="(row, i) in jsonData.inter_sup.uin_details" :key="i">
                  <p>{{ row.txval }}</p>
                </div>
              </td>
              <td class="right">
                <div v-for="(row, i) in jsonData.inter_sup.uin_details" :key="i">
                  <p>{{ row.iamt }}</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <h5>4. &nbsp; Eligible ITC</h5>
        <table class="table table-bordered">
          <thead>
            <tr>
              <th>Details</th>
              <th>Integrated Tax</th>
              <th>Central Tax</th>
              <th>State/UT tax</th>
              <th>Cess</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <b>(A) ITC Available (whether in full op part)</b>
              </td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <td>&nbsp; (1) Import of goods</td>
              <td class="right">{{ jsonData.itc_elg.itc_avl[0].iamt }}</td>
              <td class="right">{{ jsonData.itc_elg.itc_avl[0].camt }}</td>
              <td class="right">{{ jsonData.itc_elg.itc_avl[0].samt }}</td>
              <td class="right">{{ jsonData.itc_elg.itc_avl[0].csamt }}</td>
            </tr>
            <tr>
              <td>&nbsp; (2) Import of services</td>
              <td class="right">{{ jsonData.itc_elg.itc_avl[1].iamt }}</td>
              <td class="right">{{ jsonData.itc_elg.itc_avl[1].camt }}</td>
              <td class="right">{{ jsonData.itc_elg.itc_avl[1].samt }}</td>
              <td class="right">{{ jsonData.itc_elg.itc_avl[1].csamt }}</td>
            </tr>
            <tr>
              <td>&nbsp; (3) Inward supplies liable to reverse charge (other than 1 & 2 above)</td>
              <td class="right">{{ jsonData.itc_elg.itc_avl[2].iamt }}</td>
              <td class="right">{{ jsonData.itc_elg.itc_avl[2].camt }}</td>
              <td class="right">{{ jsonData.itc_elg.itc_avl[2].samt }}</td>
              <td class="right">{{ jsonData.itc_elg.itc_avl[2].csamt }}</td>
            </tr>
            <tr>
              <td>&nbsp; (4) Inward supplies from ISD</td>
              <td class="right">{{ jsonData.itc_elg.itc_avl[3].iamt }}</td>
              <td class="right">{{ jsonData.itc_elg.itc_avl[3].camt }}</td>
              <td class="right">{{ jsonData.itc_elg.itc_avl[3].samt }}</td>
              <td class="right">{{ jsonData.itc_elg.itc_avl[3].csamt }}</td>
            </tr>
            <tr>
              <td>&nbsp; (5) All other ITC</td>
              <td class="right">{{ jsonData.itc_elg.itc_avl[4].iamt }}</td>
              <td class="right">{{ jsonData.itc_elg.itc_avl[4].camt }}</td>
              <td class="right">{{ jsonData.itc_elg.itc_avl[4].samt }}</td>
              <td class="right">{{ jsonData.itc_elg.itc_avl[4].csamt }}</td>
            </tr>
            <tr>
              <td>
                <b>(B) ITC Reversed</b>
              </td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <td>&nbsp; (1) As per rules 42 & 43 of CGST Rules</td>
              <td class="right">{{ jsonData.itc_elg.itc_rev[0].iamt }}</td>
              <td class="right">{{ jsonData.itc_elg.itc_rev[0].camt }}</td>
              <td class="right">{{ jsonData.itc_elg.itc_rev[0].samt }}</td>
              <td class="right">{{ jsonData.itc_elg.itc_rev[0].csamt }}</td>
            </tr>
            <tr>
              <td>&nbsp; (2) Others</td>
              <td class="right">{{ jsonData.itc_elg.itc_rev[1].iamt }}</td>
              <td class="right">{{ jsonData.itc_elg.itc_rev[1].camt }}</td>
              <td class="right">{{ jsonData.itc_elg.itc_rev[1].samt }}</td>
              <td class="right">{{ jsonData.itc_elg.itc_rev[1].csamt }}</td>
            </tr>
            <tr>
              <td>
                <b>(C) Net ITC Available(A) - (B)</b>
              </td>
              <td class="right">{{ jsonData.itc_elg.itc_net.iamt }}</td>
              <td class="right">{{ jsonData.itc_elg.itc_net.camt }}</td>
              <td class="right">{{ jsonData.itc_elg.itc_net.samt }}</td>
              <td class="right">{{ jsonData.itc_elg.itc_net.csamt }}</td>
            </tr>
            <tr>
              <td>
                <b>(D) Ineligible ITC</b>
              </td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <td>&nbsp; (1) As per section 17(5)</td>
              <td class="right">{{ jsonData.itc_elg.itc_inelg[0].iamt }}</td>
              <td class="right">{{ jsonData.itc_elg.itc_inelg[0].camt }}</td>
              <td class="right">{{ jsonData.itc_elg.itc_inelg[0].samt }}</td>
              <td class="right">{{ jsonData.itc_elg.itc_inelg[0].csamt }}</td>
            </tr>
            <tr>
              <td>&nbsp; (2) Others</td>
              <td class="right">{{ jsonData.itc_elg.itc_inelg[1].iamt }}</td>
              <td class="right">{{ jsonData.itc_elg.itc_inelg[1].camt }}</td>
              <td class="right">{{ jsonData.itc_elg.itc_inelg[1].samt }}</td>
              <td class="right">{{ jsonData.itc_elg.itc_inelg[1].csamt }}</td>
            </tr>
          </tbody>
        </table>

        <h5>5. &nbsp;&nbsp; Values of exempt, nil rated and non-GST inward supplies</h5>
        <table class="table table-bordered">
          <thead>
            <tr>
              <th>Nature of Supplies</th>
              <th>Inter-State Supplies</th>
              <th>Intra-State Supplies</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>From a supplier under composition scheme, Exempt and Nil rated</td>
              <td class="right">{{ jsonData.inward_sup.isup_details[0].inter }}</td>
              <td class="right">{{ jsonData.inward_sup.isup_details[0].intra }}</td>
            </tr>
            <tr>
              <td>Non GST Inward Supplies</td>
              <td class="right">{{ jsonData.inward_sup.isup_details[1].inter }}</td>
              <td class="right">{{ jsonData.inward_sup.isup_details[1].intra }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'GSTR3BPrintView',
  props: ['doc'],
  computed: {
    jsonData() {
      return JSON.parse(this.doc.jsonData);
    }
  }
};
</script>

<style>
.print-format {
}
.disabled {
  background-color: #d9d9d9;
}
.right {
  text-align: right;
}
</style>


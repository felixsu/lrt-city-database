import { requireAdmin } from "@/lib/require-admin";
import { CSVImportWizard } from "./csv-import-wizard";

// Sample CSV from user's request
const INITIAL_CSV_SAMPLE = `Timestamp,Email Address,No WhatsApp,Nama Lengkap,Nomor SPPU,Nomor PPJB/SSKK,Lokasi Proyek,Tower atau Cluster,Unit,Harga Pembelian Unit Sesuai SPPU/PPJB/SSKK,Jenis Pembayaran,"Jika mengisi KPR / KPA, Apa Bank yang digunakan?",Tenor Pinjaman (bulan),Sudah berapa bulan pinjaman yang telah dibayarkan,Status Pembayaran KPA,Tuntutan,Kerugian Materiil Sesuai yang SUDAH dibayarkan,Rincian Materiil,Sisa tunggakan yang masih harus dibayarkan ,Kerugian Materiil dan Imateriil Lainnya,Dasar Perhitungan Kerugian Immateriil,Pinjam Pakai,Maksimal bersedia menunggu selama,Kompensasi
9/19/2026 10:27:44,felix.soewito@gmail.com,082188881592,Felix Soewito,0003/SAR-TPM/SPPU/1/2024,005/ACP-TPM/PPJB/0/2024,LRT City Tebet,Orchid,05-18,"1,814,820,000.00",KPR / KPA,Bank CIMB Niaga,180,27,"Belum Lunas, Sudah Tidak Membayar",Refund,"497,234,067.00","Booking Fee	                     :    20,000,000
Akad KPR	                     :    18,744,869
Asuransi Jiwa	             :    11,052,656
DP	                                     :    90,741,000
Total Cicilan ke Bank x 27:    356,695,542
	
Total: 497,234,067","1,517,284,173.00",,,,,
9/19/2026 10:31:01,lewinasari952@gmail.com,087788597148,Lewina Sari,0089/SAR-TPM/SPPU/X/2021,0089/SAR-TPM/SPPU/X/2021,LRT City Tebet,Orchid,06-25,"977,789,000.00",Cash Bertahap/Cicil ke Developer,,,,,Refund,"977,769,000.00",DP420 juta cicilan 557769000 dlm waktu 33 bulan,0.00,"146,665,350.00","Harga unit x bunga deposito 7,5 % x 24 bulan di bagi 12",,,
9/19/2026 10:36:51,itsmeanast@gmail.com,08122122270,Anastasia Christie,0003/SAR-CB/SPPU/VIII/2022,033-1/ADCP-LCC-SSKK/XI/2022,LRT City Cibubur,A,19-26,"494,200,000.00",KPR / KPA,Bank Danamon,180,36,"Belum Lunas, Sudah Tidak Membayar",Refund,"154,559,310.76",Booking Fee + DP + Asuransi + Biaya Admin + Pokok + Bunga + Auto Debet Fee + Monthly Charge + Biaya Notifikasi + Materai Akad + RTGS + Blokir Angsuran ,"374,143,304.75","14,826,000.00",SSKK Pasal 5 Ayat 8 Kompensasi Keterlambatan,,,
9/19/2026 10:37:20,reddy2308@gmail.com,081932222031,REDDY CHANDRA,0015/SAR-TPM/SPPU/X/2025,473/ADCP-PPJB/XII/2025,LRT City Tebet,Orchid,20-18,"1,900,000,000.00",Cash Keras,,,,,Refund,"1,950,000,000.00","Nilai Unit 1,9M ditambah dengan Bonus-Bonus yang ada di SPPU senilai 50juta",0.00,"3,381,000,000.00","
saya membeli sejak 2018 di Ciracas dan relokasi ke Tebet 2025. Unit saya telah lunas, dan uang yang saya setor Rp 2,225,000,000 atas total 2 unit gandeng di Tebet, 1 atas nama saya 2Br dan 1 atas nama istri saya unit studio.

Selama proses menunggu di ADCP yg Mangkrak pada tahun 2023 saya sempat terpaksa membeli rumah di PIK2 dgn cara cicilan bertahap ke developer, saya sudah membayar sebagian, tp saya kena PHK lalu ga bs bayar cicilan kembali, dan uang saya sebesar kurang lebih 500juta di ambil seluruhnya, dan rumah saya dijual kembali oleh PIK 2. masalah ini telah saya laporkan terpisah ke PKP, BPKN. Kerugian saya sangat banyak sekali akibat ADCP Mangkrak. saya mohon keadilan.

1. Kerugian nilai waktu uang / tertahannya dana
6% × 9 tahun × Rp1.900.000.000
= Rp1.026.000.000

2. Kerugian kesempatan investasi
5% × 9 tahun × Rp1.900.000.000
= Rp855.000.000

3. Kerugian pebelian rumah yang gagal di PIK2 akibat terpaksa membeli rumah baru akibat ADCP mangkrak = Rp 500.000.000

4. Kerugian biaya mental health yang terganggu, masalah keluarga, biaya transportasi saya dari Tangerang ke Jakarta selama 9 tahun = Rp 1.000.000.000 

Total Rp3.381.000.000",,,
9/19/2026 10:43:28,hizulstmm96@gmail.com,08111611674,MUHAMMAD ARIQ SULTHON HANIF,0031/SAR-CB/SPPU/XI/2021,PPJB/CBR/25/II/00012,LRT City Cibubur,A,12-26,"485,200,000.00",Cash Bertahap/Cicil ke Developer,,,,,Refund,"485,200,000.00",Booking Fee+DP+Pokok,0.00,Penalty sesuai Surat PPJB Maksimal 3%,485200000 x 3 % = 14556000,,,`;

export default async function AdminImportPage() {
  await requireAdmin();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[26px]">CSV Import & Comparison</h1>
        <p className="mt-1 text-sm text-muted">
          Analyze consumer survey data against the existing database. Rows matching{" "}
          <strong>Phone Number, Email, and Unit Number</strong> are marked as duplicates and skipped.
        </p>
      </div>

      <CSVImportWizard sampleCsvData={INITIAL_CSV_SAMPLE} />
    </div>
  );
}

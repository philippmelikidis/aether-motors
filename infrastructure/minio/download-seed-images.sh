#!/usr/bin/env bash
# -----------------------------------------------------------------------------
# Aether Motors – one-shot downloader for the bundled seed images.
#
# Run this once from any machine that has internet access. It pulls all 14
# images referenced by the SSR frontend and stores them under
#   infrastructure/minio/seed-images/<subfolder>/<key>.jpg
# with the exact filenames the `minio-init` container expects.
#
# Usage:
#   ./infrastructure/minio/download-seed-images.sh
#
# Re-running is safe: existing files are kept (use --force to overwrite).
# -----------------------------------------------------------------------------

set -u

FORCE=0
for arg in "$@"; do
  case "$arg" in
    --force|-f) FORCE=1 ;;
    --help|-h)
      sed -n '2,15p' "$0"
      exit 0 ;;
  esac
done

# Resolve target directory relative to this script's location so the script
# works regardless of where it's invoked from.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEST="${SCRIPT_DIR}/seed-images"
mkdir -p "${DEST}/merchandise" "${DEST}/vehicles" "${DEST}/gallery" "${DEST}/routes"

UA="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"
TIMEOUT=30

# pick downloader: prefer curl, fall back to wget
if command -v curl >/dev/null 2>&1; then
  DL_CMD() { curl -fL --max-time "${TIMEOUT}" -A "${UA}" -o "$2" "$1"; }
elif command -v wget >/dev/null 2>&1; then
  DL_CMD() { wget -q --timeout="${TIMEOUT}" -U "${UA}" -O "$2" "$1"; }
else
  echo "ERROR: neither curl nor wget is installed" >&2
  exit 1
fi

# -----------------------------------------------------------------------------
# Asset table: KEY|URL — kept in sync with infrastructure/minio/seed-manifest.json
# Edit either file; the manifest is authoritative for the minio-init container,
# this script is for offline pre-population.
# -----------------------------------------------------------------------------
ASSETS=(
'merchandise/zenith-shell-v1|https://lh3.googleusercontent.com/aida-public/AB6AXuA-owEgYSUyB5U6ZetwXCIhOBOl_r_Yj-gcOfHsD_LDZ6m5mtH5f9tCYRkfI261ur-i4t0ft6VOpYZmHDeZi5xLPVWEvdA8XgKkuwb78BbYdW49ee10zO7z4Ln8vQzQl_GF5ds-qFGEyl3EWV69yGOrcUqTI7xYW_c1G5gkCkRw58LZyr0VNSRkin3Yhwjb3z9VAg1a3_G6wQS4XNtqWVnWk-YxYtseOdP8lUS1eHRCTkH7ZPt_E1TclAFVDUZFy4PVhnrXx468Mqya=w2048'
'merchandise/chronos-ti-link|https://lh3.googleusercontent.com/aida-public/AB6AXuA096japkNbE_WrQw7qZKSRGJxcbpWZbrNtIUgvIS2Mk5hdr_YMJQaiZRmAFwVlxjelh6YqF-Jfx2zQxG7I8iONNNkYY1A9l2mkj9lxhjyc2eZ0Qee6vW3O6DypVDdlf55JglWbkf59U41XnBwlNF0Np8Ocfmhk-4rfQvp2dwSfnLn7FgsO--Cz5SdYLOO2FVp6Dds8w6S24ADSOJNlS50ZniUIzLGZ-hOF9Q59RnFhfEbp9MlgCsdY8lyCGmZeBTAbel0d416iAqSn=w2048'
'merchandise/velocity-01-shoe|https://lh3.googleusercontent.com/aida-public/AB6AXuAQOkzVDNVKY0Xk75bNcP8AnJzQCemzug1W009FOhwZcN_Po73mCi9MdCpBW28pliY8LRY-GB8XA0KtyTwqr53NUqppY4_QbHB8GwKHLYgCTjyFPjuw-pti9jbCMdHzZTtgFh61wqp_vql__uYLI_ch9OUBeh1GFQ1yCBgSrOkOUeAX89Poo2xIWi4y4kZssvk7g2_2sj4f_EKzoJ9fNDBFt4-Ea3DHztLuM339sPOIdENVq_3Wlle3ppBmTPraHAeKpbphiYO1ye5t=w2048'
'merchandise/zenith-diecast-1-18|https://lh3.googleusercontent.com/aida-public/AB6AXuAfhyEgIpl4agh54uBmAeAhZgMIbTHJX0xbgxgw25g6wNgXxqBg1kTsPMcVry3-b-NvVdVrWyRTYGwombqimwG70jfEULCVNuPCXBRnNdUC9reIcumHX49OBz5s9EP_rPcmM5HR8cQ4bmL6JypDBPJD12Iim8MG_mpjfIauoleloZuQBvXjMh1Kde4ctv6L79U9xU3CssvQuZfeFjk5t0lQ__K4352DqnP35immT059YztKMBZTfRxqobZEfqjeFjAq8CGxul3_cVRX=w2048'
'merchandise/schematic-tee|https://lh3.googleusercontent.com/aida-public/AB6AXuBfIp3VgYLLAYhJXUPUBebPEbj_z-CxPNczhdr_ElBWe8KU93gBhp1IpWajNtVY7lbaY0sgr8QeT9y9gBAxByAoiwKSZrNq-3iwB1jY_SzZQPSNjUp1uu1v3yNxzaA0HfgA61zXTjbGjUg8vRJzVGVwEypssOi1s9pFeqOGlQPJpAE64HSFlcJTmc0YJb9LebXURSSy6IiFQnbDQv-O68gis-u62DRzHj5GXVyRKjK0iSpZ_pBCplFsuAFgDWSIHHt-nNb2KNIQ09pK=w2048'
'merchandise/hero|https://lh3.googleusercontent.com/aida-public/AB6AXuCU97LLEAz9FZHtFN2Lp5mXDS_3xJBSRqWtSrRZ2o67ejre8HoDQTqNstF34vfY8rHbGhmgBdU6Tg7CINhHCN_8hNFyZwkBvBmH64ixrYFJfRcSPENmB1f8QuT8_AsOf4dhAIulrssyXkePNGoOXlg5RXnvvfaA5ZTwk-iJFTyK3-ym2M6aHEQ5QjMKPZTCpGVJZfukJ5PZIZnlV-0RnUNFkmW3xippA_PYY2xB_9xYyvYt7GNsHsmWfsphxPXo_ClOzq1raUH15mi4=w2048'
'vehicles/project-zenith|https://lh3.googleusercontent.com/aida-public/AB6AXuAttOYZxqZWqwfqWjtn9cb8_dBAm9w9HmGqghvYSRpVpGZ3UEmQL0PwmXqLIR-kflvbydea0TU1qAJCN9VXnQRkywVlzGz-muoSE8VgODS_jE3c2ZGgWMIYSXtT2JHfzKBnhDtfxJmOupFtVIc_LXplcTwY7TrLT49rJDo6DtkhzfvE_A-ShgxrzvPsaGIxoNsfGyP-yprHAcHBnSTLIdLSPpTTV7yPk-Uqd4A3BB3gbnWAxOzwmWxsbkXF8LdJdroJQYClpiq1aNmP=w2048'
'gallery/kinetic-sculpting|https://lh3.googleusercontent.com/aida-public/AB6AXuAQ-BUKYm6zwpWNJkprHYXoKhrTEA0TYzDwnE1fLMiKUoBAAXFu9I5qfx-GZZE2_-6LsxRk3PUH8BacR59w2GJzOl5YgfBQ38dw-VmI7VZZMmsaGzuKVC-XPQrcLz_br9QvYwd8oZy_wMe1Rv7tppNIDjQP3SSGFI4iI_VsHNkAsDBz5IVqIftHBVarUvod94oiMA7PfCK8U8boomkijr1T-M7pibt9-CfcinLIj7u4liN1Kq7CWveo7Ad_teiVcqW12Qa7D01zDCtW=w2048'
'gallery/the-cockpit|https://lh3.googleusercontent.com/aida-public/AB6AXuDaWpWE--H52gp6umrRRBKWf6NFs_aXg46S1S9qmbhK07T0CRDrkaFns7KskMdGNJbfDi0GlPhhTZuvV6ATJuVgnqIr2mSsk8xI5r6jA0B-8Am9x07UZX9KCH0c_2eiSXnTxA-ytTGLZUpZvXqETQNf-eJBnJ4yQZ0zeVcE5dgCo3vxU8FwOz-LjeXwXpyH_hBgWzMS0qHCmLhijbOl0EieRan9nkqZkh23QAsVQZJkUaEayPYNMCkaej76cj8kgm0yeCbbbj_0CkB4=w2048'
'gallery/v12-acoustic-test|https://lh3.googleusercontent.com/aida-public/AB6AXuA7I1vqMulAIdCDSc5NaTRaFJfl-r4ycMzJBpkw1U76h9g9O98f4LgxNokkgXoouIjJGe62PS_b0IhKPHf78O09_fvMijTV12gj9GSGuDDCJrhRYDoz0W2qVgaSj5N--beEyWq0NNDMM47FB4UgEGXPVeWYBLCoRwOVboRhsdGXhCxXzYJBLt6X8yMQV-JuzqQZRlcYMIMNwF0T5ZPVYC6bb347Vn8uIIZjwqacDfl4YnNArT6vMYcMWU8EUbFPjUavoVeOs_PWXckp=w2048'
'gallery/carbon-lite-alloys|https://lh3.googleusercontent.com/aida-public/AB6AXuALVh4mIJr9eRGRE2qByhAhQt_edw9qMLkioKwwPN75eh7VBzTz-PC_zT88YY7cmLzFlZZ8nuzSpa-1nKmN3yn5ipkKxJyJrr5d25Gk4lRDqAILZ7xqEEOYhbTYpgpet96NCRYYb96x41aacV_3Yro31BAtYUFZwz0nRC_C-jJEp1tzokm2Zu_6BCfyysRqcySUukina2iI3OUGGZvlU-Ek_NDrGEhHOrXGw-gthIatWigeqal82MCQC9lh7GpHsorNh7E5HnXmAkVG=w2048'
'gallery/the-fleet-evolution|https://lh3.googleusercontent.com/aida-public/AB6AXuDzL44-yawWOvPa_yYfmag8cyg-a7NovMxUh4x_Ew7gYbkfY8TtsHIaniujSSPyRmYRxp12sXTxPvmcC-h0RhnA0IsaoLOWsCc28IP6dldlZfiQ6tw7qUAxcU_7wwNbAVD1qdou9JOhS3fJ8uVZYbuPHohfFUCPnKMwJfcLg-_5dDTxEJh2zsi2CvF8_TBKFXYypV1WcFJ-gDtKGPPzWHxwlsAOrPG1vDZakmSkP7Rfvosmc--r1GtXz4fpxwelucDX9ISnoPLCx8tz=w2048'
'gallery/zenith-manifesto|https://lh3.googleusercontent.com/aida-public/AB6AXuC1wP3gwLbl_Zfni0ZpJMZNohPRQuldZOYzFyB2stKhRupgTFT3bAkRk3GhF-qGI3fCfeXM77B5S3WTDk4JnDxaSb6b4GEu3L_M4k2tGTv8ayqrQk-S5JBV8nZ5pLjDbN9GBmyNwgf3awqH_kD-tx6YTpLZrGu9cGzKKxOCtMJEfYxmsILGLIt4CWnAnrLZy1mPR5CZh1w1h7d1rCf3Fcmplnah5kIEWCSVUUxe2DEvBrgE_2IZMsM2UnZ_9Ec7XGx0FPBMGAYU9T6n=w2048'
'routes/zenith-route|https://lh3.googleusercontent.com/aida-public/AB6AXuCdRWEj3FZzXaLGAaLIRfy592M5wW00OPxp57JbrcF-2Hf8ApjExUelJ782u2HmUpRhRkh7FO6DalSdAMtp2Mw5_MTiSPbCBTOJPdQl2C_p_TIbCJJq9sJ6wjd0v-S-7auw3iWW2j8HADz03_pdcpR91N6MzbOFWDvbsjnK_jc7xyMRZWNAemWPo9lRwy0v_sDsIapjc8jemSWtQTfzsmas420ujThMZ-0J2pK9DZOlleqoECcpj_XF7Ix1rnBZhQTrKhVjCcw7UtbG=w2048'
)

echo "Target directory: ${DEST}"
echo "Mode: $([ ${FORCE} -eq 1 ] && echo 'force (overwrite existing)' || echo 'skip existing files')"
echo

ok=0; skipped=0; failed=0
failed_keys=""

for row in "${ASSETS[@]}"; do
  key="${row%%|*}"
  url="${row#*|}"
  out="${DEST}/${key}.jpg"

  if [ -s "${out}" ] && [ ${FORCE} -eq 0 ]; then
    printf '  skip   %s  (already %d bytes)\n' "${key}.jpg" "$(wc -c < "${out}")"
    skipped=$((skipped + 1))
    continue
  fi

  printf '  fetch  %s ... ' "${key}.jpg"
  if DL_CMD "${url}" "${out}" 2>/dev/null && [ -s "${out}" ]; then
    bytes=$(wc -c < "${out}")
    printf 'ok  (%s bytes)\n' "${bytes}"
    ok=$((ok + 1))
  else
    printf 'FAILED\n'
    rm -f "${out}"
    failed=$((failed + 1))
    failed_keys="${failed_keys}\n    - ${key}.jpg"
  fi
done

echo
echo "Summary:"
echo "  downloaded:        ${ok}"
echo "  already present:   ${skipped}"
echo "  failed:            ${failed}"

if [ "${failed}" -gt 0 ]; then
  printf 'Failed downloads (URL likely expired):%b\n' "${failed_keys}"
  echo
  echo "Drop replacement JPGs into the matching subfolder under:"
  echo "  ${DEST}/"
  echo "(see seed-images/README.md for the exact filenames)."
  exit 1
fi

echo
echo "Done. Restart the stack to pick the new files up:"
echo "  docker compose down -v && docker compose up --build"

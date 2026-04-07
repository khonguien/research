# Distributed under the OSI-approved MIT License.  See accompanying
# file LICENSE or https://github.com/Crascit/DownloadProject for details.

cmake_minimum_required(VERSION 2.8.2)

project(json-download NONE)

include(ExternalProject)
ExternalProject_Add(json-download
                    GIT_CONFIG advice.detachedHead=false;URL;https://github.com/nlohmann/json/releases/download/v3.1.2/include.zip;URL_HASH;SHA256=495362ee1b9d03d9526ba9ccf1b4a9c37691abe3a642ddbced13e5778c16660c
                    SOURCE_DIR          "/mnt/d/eFlesh-main/eFlesh-main/microstructure/microstructure_inflators/cmake/../3rdparty/json"
                    BINARY_DIR          "/mnt/d/eFlesh-main/eFlesh-main/microstructure/microstructure_inflators/build/json-build"
                    CONFIGURE_COMMAND   ""
                    BUILD_COMMAND       ""
                    INSTALL_COMMAND     ""
                    TEST_COMMAND        ""
)

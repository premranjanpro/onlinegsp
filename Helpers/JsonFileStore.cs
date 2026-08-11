using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading;
using Newtonsoft.Json;

namespace OnlineGspApp.Helpers
{
    public static class JsonFileStore
    {
        private static readonly Dictionary<string, ReaderWriterLockSlim> _locks = new Dictionary<string, ReaderWriterLockSlim>();
        private static ReaderWriterLockSlim GetLock(string path)
        {
            lock (_locks)
            {
                if (!_locks.ContainsKey(path)) _locks[path] = new ReaderWriterLockSlim();
                return _locks[path];
            }
        }

        public static List<T> ReadAll<T>(string filePath)
        {
            var locker = GetLock(filePath);
            locker.EnterReadLock();
            try
            {
                if (!File.Exists(filePath)) return new List<T>();
                var txt = File.ReadAllText(filePath);
                if (string.IsNullOrWhiteSpace(txt)) return new List<T>();
                return JsonConvert.DeserializeObject<List<T>>(txt) ?? new List<T>();
            }
            finally { locker.ExitReadLock(); }
        }

        public static void WriteAll<T>(string filePath, List<T> list)
        {
            var locker = GetLock(filePath);
            locker.EnterWriteLock();
            try
            {
                var dir = Path.GetDirectoryName(filePath);
                if (!Directory.Exists(dir)) Directory.CreateDirectory(dir);
                var tmp = filePath + ".tmp";
                File.WriteAllText(tmp, JsonConvert.SerializeObject(list, Formatting.Indented));
                if (File.Exists(filePath))
                {
                    var bak = filePath + "." + DateTime.UtcNow.ToString("yyyyMMddHHmmss") + ".bak";
                    File.Replace(tmp, filePath, bak, true);
                }
                else
                {
                    File.Move(tmp, filePath);
                }
            }
            finally { locker.ExitWriteLock(); }
        }

        public static void AddItem<T>(string filePath, T item)
        {
            var list = ReadAll<T>(filePath);
            list.Add(item);
            WriteAll(filePath, list);
        }

        public static bool UpdateItem<T>(string filePath, Func<T, bool> predicate, Func<T, T> updater)
        {
            var list = ReadAll<T>(filePath);
            var idx = list.FindIndex(x => predicate(x));
            if (idx < 0) return false;
            list[idx] = updater(list[idx]);
            WriteAll(filePath, list);
            return true;
        }

        public static bool RemoveItem<T>(string filePath, Func<T, bool> predicate)
        {
            var list = ReadAll<T>(filePath);
            var removed = list.RemoveAll(new Predicate<T>(predicate));
            if (removed > 0) WriteAll(filePath, list);
            return removed > 0;
        }
    }
}
